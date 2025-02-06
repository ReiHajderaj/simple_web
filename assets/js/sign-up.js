const signUpForm = document.querySelector('.sign-up-form');

signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fullname = document.querySelector('#fullname').value;
    const email = document.querySelector('#email').value;

    const password = document.querySelector('#password').value;

    const confirmPassword = document.querySelector('#confirm-password').value;

    if (fullname.length < 6) {
        alert('Fullname must be at least 6 characters');
        return;
    }

    if (!email.includes('@') && !email.includes('.')) {
        alert('Email must be in the correct format');
        return;
    }

    if (password.length < 8) {
        alert('Password must be at least 8 characters');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    signUp(fullname, email, password);
});

const signUp = async (fullname, email, password) => {
    const data = {
        fullname,
        email,
        password
    };

    try {
        const response = await fetch('../../api/auth/sign-up.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        

        if (response.ok) {
            const result = await response.json();
            
            if (result.status === 201) {
                // sessionStorage.setItem('image', result.image);
                window.location.href = '../../dashboard';
            }   else {
                displayError(result.message || 'An error occurred during sign up. Please try again.');
            }
        } else {
            displayError(result.message || 'An error occurred during sign up. Please try again.');
        }
    } catch (error) {
        console.error(error);
        displayError('Unable to connect to the server. Please try again later.', error);
    }
};

// Helper function to display errors
const displayError = (message) => {
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    const errorMessage = document.createElement('div');
    errorMessage.classList.add('error-message');
    errorMessage.textContent = message;
    signUpForm.appendChild(errorMessage);

    // Remove error message after 5 seconds
    setTimeout(() => {
        errorMessage.remove();
    }, 5000);
};