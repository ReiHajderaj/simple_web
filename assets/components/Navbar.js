const Navbar = async () => {


    const nav = document.querySelector('.navbar');
    try {
        const request = await fetch('/simple_web/api/users/getCurrentUser.php');
        if(request.ok){
            
            const data = await request.json();
            if(data.error){
                window.location.href = '/simple_web/auth/sign-in/';
            } else if(data.status === 201){
                nav.innerHTML +=`
                <a class="logo" href="/simple_web/dashboard">
                        <img src="/simple_web/assets/icons/icon.png" alt="Logo" class="logo_img" />
                    </a>
                    <div class="search_container">
                        <div class="search_box">
                            <input type="text" id="navSearchInput" placeholder="Search" />
                            <div id="navSearchDropdown" class="search-dropdown"></div>
                        </div>
                    </div>
                    <div class="user_container">
                        <div class="user_box">
                            <div class="username">
                                ${data.message.username}
                            </div>
                                
                            
                            <div class="user_photo">
                                <a href='/simple_web/dashboard/home' class="photo">
                                    <img src="/simple_web/assets/images/avatars/${data.message.profile_image_url}" alt="Profile Picture" />
                                </a>
                            </div>
                            <button class="logout-button" >
                                </button>
                        </div>
                    </div>
                    `
            ;
            }
            
        }
    } catch (error) {
        console.error(error);
    }

    const logout = async () =>{
        try{
            const request = await fetch('/simple_web/api/users/logout.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if(request.ok){
                window.location.href = '/simple_web/auth/sign-in/';
            }
        } catch (error) {
            console.error(error);
        }
    }
    
    const logoutBtn = document.querySelector('.logout-button');
    logoutBtn.addEventListener('click', logout);
    
    

    // Add search functionality
    const searchInput = document.querySelector('#navSearchInput');
    const searchDropdown = document.querySelector('#navSearchDropdown');
    let users = [];

    try {
        const usersRequest = await fetch('/simple_web/api/users/getUsers.php');
        if (usersRequest.ok) {
            const response = await usersRequest.json();
            if (!response.error) {
                users = response;
                
                searchInput.addEventListener('input', (e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    const filteredUsers = users.filter(user => 
                        user.username.toLowerCase().includes(searchTerm) || 
                        user.email.toLowerCase().includes(searchTerm)
                    );
                    
                    searchDropdown.innerHTML = '';
                    
                    if (searchTerm && filteredUsers.length > 0) {
                        searchDropdown.style.display = 'block';
                        filteredUsers.forEach(user => {
                            const option = document.createElement('div');
                            option.classList.add('dropdown-item');
                            option.innerHTML = `
                                <div class="user-info">
                                    <div class="username">${user.username}</div>
                                    <div class="email">${user.email}</div>
                                </div>
                            `;
                            option.addEventListener('click', () => {
                                window.location.href = `/simple_web/dashboard/user?id=${user.id}`;
                            });
                            searchDropdown.appendChild(option);
                        });
                    } else {
                        searchDropdown.style.display = 'none';
                    }
                });

                // Close dropdown when clicking outside
                document.addEventListener('click', (e) => {
                    if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
                        searchDropdown.style.display = 'none';
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}


Navbar();