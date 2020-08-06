nlm <- function(f, p, ..., hessian=FALSE, typsize=rep(1,length(p)),
                fscale=1, print.level=0, ndigit=12, gradtol=1e-6,
                stepmax=max(1000 * sqrt(sum((p/typsize)^2)), 1000),
                steptol=1e-6, iterlim=100, check.analyticals=TRUE)
{
    
    print.level <- as.integer(print.level)
    if(print.level < 0 || print.level > 2)
        stop("'print.level' must be in {0,1,2}")
    ## msg is collection of bits, i.e., sum of 2^k (k = 0,..,4):
    msg <- (1 + c(8,0,16))[1+print.level]
    if(!check.analyticals) msg <- msg + (2 + 4)
    .External2(C_nlm, function(x) f(x, ...), p, hessian, typsize, fscale,
               msg, ndigit, gradtol, stepmax, steptol, iterlim)
}
