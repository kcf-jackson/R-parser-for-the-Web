# Line of attack
# 1. Use JS parser to turn a R file to a JSON file
# 2. Use R to convert the resulting JSON into a R list
# 3. Use R to convert the original R file into a R list
# 4. Compare two lists
options(keep.source = TRUE)  # this line is needed to make Rscript consistent with R

library(magrittr)
library(crayon)
JS_folder <- "./tests/test_files/JSON_files"
R_folder <- "./tests/test_files/R_files"

# Helper functions for analysis -------------------------------------------
load_JS <- function(file) {
    readLines(file) %>%
        jsonlite::fromJSON(simplifyVector = F) %>%
        {purrr::compact(walk(., identity, purrr::compact))}
}

load_R <- function(x, file = T) {
    ast <- if (file) parse(file = x) else parse(text = x)  # see note 1
    Map(as_clean_list, ast)
}

# Note 1: the explicit branching is used because the `file(.)` call
# needed in `rlang::parse_expr` causes an issue with `srcref`. While
# the parse with and without `file` are the same, the `srcref` is
# returned as `srcref` in one and as `NULL` in another.


#' as_clean_list :: R lang obj -> R list
as_clean_list <- function(ast) {
    g <- purrr::compose(name_indent, purrr::compact)
    walk(ast, f = clean_deparse, g = g)
}

#' Walk a tree recursively
#' @param f applies to leaves
#' @param g post-processes trees
#' walk :: R lang obj -> (R lang obj -> a) -> ([a] -> [a]) -> [a]
walk <- function(ast, f, g = identity) {
    if (is.call(ast)) {
        g(purrr::map(ast, walk, f = f, g = g))
    } else {
        f(ast)
    }
}

#' clean_deparse :: R lang obj -> char
#' This function throws away "srcref" and handles pairlist.
clean_deparse <- function(x, ...) {
    if (class(x) == "srcref") return(NULL)
    if (class(x) == "pairlist") return(list(Map(as_clean_list, x)))
    deparse(x, ...)
}

#' This function is needed to handle named args in function calls,
#' because R allows a list to be partially named.
name_indent <- function(x) {
    ind <- which(names(x) != "")
    for (i in ind) { x[[i]] <- x[i] }
    setNames(x, NULL)
}


# Helper functions for comparison -----------------------------------------
deep_compare <- function(f, R_ast, JS_ast, debug = F) {
    if (is.list(R_ast) && is.list(JS_ast)) {
        if (!is.null(names(R_ast))) {
            if (debug) {
                cat("R :  " %+% paste(names(R_ast), collapse = ", ") %+% '\n')
                cat("JS:  " %+% paste(names(JS_ast), collapse = ", ") %+% '\n')
            }
            # Since in R, the name of a list can be a symbol or string, e.g.
            # x or "x", we accept the unprocessed version of both of them,
            # i.e. "x" or "\"x\"".
            if (!all(purrr::map2_lgl(names(R_ast), names(JS_ast), equal))) {
                stop("Names of a list do not match.")
            }
        }
        purrr::map2(R_ast, JS_ast, ~deep_compare(f, .x, .y, debug))
    } else {
        if (debug) {
            cat("R :  " %+% R_ast %+% '\n')
            cat("JS:  " %+% JS_ast %+% '\n')
        }
        res <- f(R_ast, JS_ast)
        if (debug && !res) {
            browser()
            bin <- readline("Continue?")
        }
        res
    }
}

# This function is needed to handle the "cosmetic" difference between
# the results from the R parser and the JS parser.
equal <- function(Rx, JSy) {
    log <- F
    logcat <- function(x) if (log) cat(x)
    # Allows for empty list in the JS parse tree
    # There is no corresponding entry in R, so the comparison will be skipped.
    # This happens when for example a function is called with no arguments,
    # then R would parse "f()" as ["f"], and JS would parse it as ["f", {}].
    if (is.list(JSy) && (length(JSy) == 0)) {
        logcat(green("Detect empty list() in JS parse tree => Skip.\n"))
        return(TRUE)
    }

    if (xor(is.list(Rx), is.list(JSy))) {
        # print("Type mismatch.")
        return(FALSE)
    }

    if (length(Rx) != length(JSy)) {
        # print("Type correct, length mismatch.")
        return(FALSE)
    }

    # Allows for unprocessed numbers
    if (is_numeric(Rx) && is_numeric(JSy)) {
        logcat(green("Detect unprocessed numbers => Compare after parsing.\n"))
        nRx <- as.numeric(Rx)
        nJSy <- as.numeric(JSy)
        return((nRx == nJSy) || (abs(1 - nJSy / nRx) < 1e-14))  # See note 2. (Order is strict)
    }

    # Allows for unprocessed backtick quotation
    if (is_backtick(JSy)) {
        logcat(green("Detect unprocessed backtick => Compare after parsing.\n"))
        return(Rx == deparse(rlang::parse_expr(JSy)))
    }

    # Allows for unprocessed double quotation
    if (is.character(Rx) && is.character(JSy)) {
        return((Rx == JSy) || (Rx == rlang::parse_expr(JSy)) ||   # (Order is strict)
                   (Rx == substring(capture.output(rlang::parse_expr(JSy)), 5)) || # See note 3.
                   (rlang::parse_expr(Rx) == rlang::parse_expr(JSy)))
    }

    return(Rx == JSy)
}

# Note 2: the comparison is performed with inequality because in `arith-true.R`,
# the Euler's gamma constant has too many digits which results in some floating-
# point errors of size about 1e-16.
#
# Note 3: the strange-looking check is to get pass a peculiar problem located at
# `Rd2HTML.R` regarding the invalid string:
#     "[\u0001-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]".
# This string is problematic by construction! In fact, you can't even assign
# this string to a variable. The JS parser is correct; the test has issue, and
# it is one that cannot be bypassed easily (unless one is willing to skip the
# whole file.)
#
# For now, I'll put in the new check, as it has little effect on the other cases.


is_numeric <- function(x) {
    !is.na(purrr::quietly(as.numeric)(x)$result)
}

is_backtick <- function(x) {
    (substr(x, 1, 1) == "`") &&
        (substr(x, nchar(x), nchar(x)) == "`")
}

is_double_escape_quotes <- function(x) {
    (substr(x, 1, 1) == "\"") &&
        (substr(x, nchar(x), nchar(x)) == "\"")
}


# Helper functions for tidy display --------------------------------------
`%+%` <- paste0

trim_list <- function(x, level) {
    if (level == 0) {
        res <- jsonlite::toJSON(x)
        if (nchar(res) > 20) {
            return(substr(res, 0, 10) %+% "...")
        }
        return(res)
    } else {
        if (is.list(x)) {
            purrr::map(x, trim_list, level = level - 1)
        } else {
            x
        }
    }
}


# Main code --------------------------------------------------------------
run_batch <- TRUE

if (!run_batch) {
    # Single file
    JS_file <- file.path(JS_folder, "0217634859_raster.json")
    R_file <- file.path(R_folder, "0217634859_raster.R")

    JS_ast <- load_JS(JS_file)
    R_ast <- load_R(R_file)

    check <- deep_compare(equal, R_ast, JS_ast, debug = T)
    print(all(unlist(check)))

} else {
    # Multiple files - Expect 3 types of warnings
    cat("Testing if the parse trees returned by the JS parser align with the ones returned by R:\n")
    test_results <- purrr::map_lgl(
        list.files(JS_folder, full.names = T),
        function(JS_file) {
            fname <- tools::file_path_sans_ext(basename(JS_file))
            R_file <- file.path(R_folder, fname %+% ".R")

            JS_ast <- load_JS(JS_file)
            R_ast <- load_R(R_file)

            check <- all(unlist(deep_compare(equal, R_ast, JS_ast)))
            cat(fname %+% ": " %+%
                    (if (check) green("Pass") else red("Fail")) %+%
                    '\n')
            return(check)
       }
    )
    cat("Tests: " %+% length(test_results) %+%
            "; Pass: " %+% green(sum(test_results)) %+%
            "; Fail: " %+% red(length(test_results) - sum(test_results)) %+%
            '\n')
    if (sum(test_results) != length(test_results)) {
        cat("The files that fail the tests:\n")
        cat(paste(list.files(JS_folder)[which(!test_results)], collapse = "\n"))
    }
    cat("Some warnings are expected parsing the files.\n")
}


# # File that causes (expected) warning
# check_warning_files <- function(dir0) {
#     flist <- list.files(dir0)
#     ind <- which(purrr::map_lgl(
#         list.files(dir0, full.names = T),
#         ~!purrr::is_empty(purrr::quietly(parse)(file = .x)$warnings)
#     ))
#     flist[ind]
# }
# check_warning_files(R_folder)
# # [1] "reg-tests-1c.R" "simple-true.R"
