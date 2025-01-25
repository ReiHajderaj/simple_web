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
                            <input type="text" placeholder="Search" /><button>Search</button>
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
            const request = await fetch('/simple_web/api/users/logout.php');
            if(request.ok){
                window.location.href = '/simple_web/auth/sign-in/';
            }
        } catch (error) {
            console.error(error);
        }
    }
    
    const logoutBtn = document.querySelector('.logout-button');
    logoutBtn.addEventListener('click', logout);
    
    

}


Navbar();