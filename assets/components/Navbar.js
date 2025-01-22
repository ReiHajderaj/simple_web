const Navbar = () => {


    const nav = document.querySelector('.navbar');

    
    
    nav.innerHTML +=`
        <a class="logo" href="/dashboard">
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
                        user#0022
                    </div>
                        
                    
                    <div class="user_photo">
                        <div class="photo"></div>
                    </div>
                    <button class="logout-button">
                        </button>
                </div>
            </div>
            `
    ;

}


Navbar();