function get_divisors(number, sorted = false) {
    let divisors = []
    for (let i = 2; i < Math.sqrt(number) + 1; i++) {
        if (number % i == 0) {
            divisors.push(i)
            divisors.push(Math.round(number / i))
        }
    }

    if (sorted) divisors.sort(function (a, b) {
        return a - b
    });

    return divisors
}
