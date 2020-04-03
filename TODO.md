# Future directions
1. The process of ಪ್ರಸ್ತಾರ - identifying ಲಘು and ಗುರು given a verse is easy, and governed by set of rules. However, ಶಿಥಿಲದ್ವಿತ್ವ poses a hardship to it. In the presence of ಶಿಥಿಲದ್ವಿತ್ವ, the ಅಕ್ಷರ behind the ಸಂಯುಕ್ತ remains ಲಘು. The implementation of ಶಿಥಿಲದ್ವಿತ್ವ is unclear, as I am unaware of any rules that govern it. In case of no rules, we have to maintain a set of words having ಶಿಥಿಲದ್ವಿತ್ವ, and, use them while doing ಪ್ರಸ್ತಾರ
2. The process of identifying ಛಂದಸ್ needs several clever algorithms. In case of ಅಕ್ಷರಗಣ, the case is easy, as we can do a simple pattern matching using sophesticated data structures like `trie`. However, approximate matching here remains challenging. This problem is stated formally as follows
    
        Input : A set 'S' of bit-patterns of varying length
                A bit-pattern 'p'
        Output: The bit-patterns 'near' to the input pattern 'p' in 'S'
        Example:
            Let S = {1, 101, 0011, 1001110101}
                p = 1011
            Output = {101, 0011} with some notion of nearness
        Notes:
            - Edit distance can not be used directly as patterns are of variable length
            - Any binary distance measure can be used, but it is O(n) terms of distance calculations. Furthermore, if distance measure takes linear time in terms of input patern, whole process will be of quadratic time. Can we do better here?
            - Dynamic programming approach can be used here. By doing some sort of precomputation on patterns in set 'S' (ex. converting it to trie, for exact matching), we are going to reduce matching time; also, by doing pre-computation, it should be possible for us to infer some sort of relationships between patterns in 'S' itself (ex. substring relationships,..).
3. Identifying ಮಾತ್ರಾಗಣ is also tricky, and can be stated formally as belows.
        
        Input:  A set 'S' of *integer* patterns of varying length
                A bit pattern 'p', where each bit 0 has a weight 1, and 1 bit has a weight 2
        Output: The patterns near to 'p' from 'S'
        Example:
            Let S = {3|4|3|4, 4|4|4}
            p = 00010001001
            output = 3|4|3|4
            Explanation:
                group p as 000|100|01|001
                But it is impossible to group it as 4|4|4
        Notes: 
            - Approximate matchig should also be possible
4. Identifying ಅಂಶಗಣ is more tricker.

    Input:  A set 'S' of *symbol* patterns of varying length, where each symbol can correspond to bit patterns of finite lenghts (to be precise, n and n+1. n depends on the symbol)
    A bit pattern 'p'
    Output: The patterns near to 'p' from 'S'
    Example:
        to-do
    Notes: 
            - Approximate matchig should also be possible
5. In all problems, since the set of patterns 'S' is fixed, ML based (simple, engineered) approaches can also be explored
    
