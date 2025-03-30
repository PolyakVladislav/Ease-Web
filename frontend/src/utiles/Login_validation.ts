export const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(email.length === 0){
        return false;
    }
    return re.test(String(email).toLowerCase());
};

export const validatePassword = (password: string): boolean => {
    // Example: Password must be at least 6 characters long
    return password.length >= 6;
};