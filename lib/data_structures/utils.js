function Gaussian(mu, sigma) {
    return x => Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2))
}

export {Gaussian}