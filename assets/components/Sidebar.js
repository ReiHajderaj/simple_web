const Sidebar = () => {
    const sidebar = document.querySelector('.side_nav');
    

    sidebar.innerHTML += `
        <div class="span_nav">Side Navigator</div>
                
                <div class="snav_items">
                    <div class="item">
                        <div  class="item_banner" 
                        
                        onclick="goHome()">Home</div>
                        <div class="notifications">
                        </div>
                    </div>
                    <div class="item">
                        <div  class="item_banner" 
                        
                        onclick="populateNotifications()">Notifications</div>
                        <div class="notifications">
                        </div>
                    </div>
                    <div class="item" >
                        <div id='add_friend' class="item_banner" onclick="addFriendInput()">Add A Friend</div>
                        <div class="add_friend_input">
                            <input list="friendsList" id="friendSelect" placeholder="Search by name or email">
    <datalist id="friendsList">
        <!-- Options will be populated dynamically -->
    </datalist>
                            <button id="add_friend_btn">Send Request</button>
                        </div>
                    </div>
                    <div class="item">
                        <div onclick='getFriends(event)' class="item_banner">Friend List</div>
                        
                    </div>
                    <div class = "item">
                        <div onclick='goSettings()' class="item_banner">
                            Account Settings
                        </div>
                    </div>
                </div>
    `;

    
}

const goSettings = () =>{
    window.location.href = '/simple_web/dashboard/settings'
}

const goHome = () =>{
    window.location.href = '/simple_web/dashboard/home'
}

const addFriendInput = () => {
    const addFriendInput = document.querySelector('.add_friend_input');
    addFriendInput.classList.toggle('active');
}

const populateNotifications = async () => {
    const notifications = document.querySelector('.notifications');
    notifications.classList.toggle('active');
    notifications.innerHTML = '';

    try{
        const request = await fetch('/simple_web/api/users/getNotifications.php');
        if(request.ok){
            const response = await request.json();
           
            if(response.error){
                console.error('Error populating notifications:', response.message);
                window.location.href = '/simple_web/auth/sign-in';
            }
                else{
                response.forEach(async notification => {
                    const notificationDiv = document.createElement('div');
                    
                    notificationDiv.classList.add('friend-request-notification');
                    if(notification.type == 'friend_request'){
                        const getNameRequest = await fetch('/simple_web/api/users/getUserId.php', {
                            method: 'POST',
                            body: JSON.stringify({id: notification.source_id}),
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        })
                        if(getNameRequest.ok){
                            const nameResponse = await getNameRequest.json();
                            if(nameResponse.status == 201){
                                notificationDiv.innerHTML = `
                                <span class="request-text">Friend request from ${nameResponse.message.username}</span>
                                <div class="request-actions">
                                    <button class="request-btn accept" onclick="handleFriendRequest(${notification.source_id}, 'accept', event)"></button>
                                    <button class="request-btn reject" onclick="handleFriendRequest(${notification.source_id}, 'reject', event)"></button>
                                </div>
                            `;
                            }
                            
                        }
                       
                    }
                    notifications.appendChild(notificationDiv);
                });
            }
        }
    } catch(error){
        console.error('Error populating notifications:', error);
    }
}


const populateFriendsList = async () => {
    const friendsList = document.querySelector('#friendsList');

    
    try{
        const request = await fetch('/simple_web/api/users/getUsers.php');
        if(request.ok){
            const response = await request.json();
            if(response.error){
                console.error('Error populating friends list:', response.message);
                window.location.href = '/simple_web/auth/sign-in';
            }
            else{
                response.forEach(friend => {
                    // console.log(friend);
                    
                    const option = document.createElement('option');
                    option.value = friend.username;
                    option.textContent = friend.email;
                    friendsList.appendChild(option);
                });
            }
            
        }

        
    } catch(error){
        console.error('Error populating friends list:', error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    Sidebar();
    populateFriendsList();
    const sendRequestBtn = document.querySelector('#add_friend_btn');

    sendRequestBtn.addEventListener('click', async (e) =>{
        const username = document.querySelector('#friendSelect').value;

        try {
            const request = await fetch('/simple_web/api/users/sendFriendRequest.php',{
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username
                })
            })

            if(request.ok){
                const response = await request.json();
                
                if(response.error){
                    console.error('Error populating friends list:', response.message);
                    window.location.href = '/simple_web/auth/sign-in';
                } else if(response.status === 201){
                    console.log(response);
                } else{
                    
                    displayError(response.message) 
                }
            }
        } catch (error) {
            console.error("Fetching error: ", error);
            
        }
    })
});

const handleFriendRequest = async (sender, type, e) =>{
    try {

        
        
        const request = await fetch('/simple_web/api/users/handleFriend.php',{
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sender, 
                    type,
                })
            })
        
        if (request.ok){
            const response = await request.json()
            console.log(response);
            
            if (response.error){
                console.error('Error on handleFriendRequest:', response.message);
                    window.location.href = '/simple_web/auth/sign-in';
            } else if(response.status == 201){
                console.log(response);
                e.target.parentElement.parentElement.remove();
            } else{
                displayError(response.message);
            }
        }
    } catch (error) {
        console.error('Fetching Error: ', error);
        
    }
}

const displayError = (message) => {
    const friendDiv = document.querySelector('.add_friend_input')

    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    const errorMessage = document.createElement('div');
    errorMessage.classList.add('error-message');
    errorMessage.textContent = message;
    friendDiv.appendChild(errorMessage);

    // Remove error message after 5 seconds
    setTimeout(() => {
        errorMessage.remove();
    }, 5000);
};

const getFriends = async (e) => {
    const friendListDiv = e.target.parentElement;
    const existingList = friendListDiv.querySelector('.friends-list');
    
    // Toggle existing list if it exists
    if (existingList) {
        existingList.remove();
        return;
    }

    try {
        const request = await fetch('/simple_web/api/users/getFriends.php');
        if (request.ok) {
            const response = await request.json();
            // console.log(response);
            
            if (response.error) {
                console.error('Error getting friends:', response.message);
                window.location.href = '/simple_web/auth/sign-in';
                return;
             }
             else if(response.status = 201){
                const friendsListContainer = document.createElement('div');
                            friendsListContainer.classList.add('friends-list', 'active');  

                if (response.message.length === 0) {
                    friendsListContainer.innerHTML = '<p class="no-friends">No friends added yet</p>';
                } else {
                    response.message.forEach(async friendId => {
                        const detailResponse = await fetch('/simple_web/api/users/getUserId.php', {
                            method: 'POST',
                            body: JSON.stringify({id: friendId}),
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        })

                        if(detailResponse.ok){
                            const detailResult = await detailResponse.json();
                            const friend = detailResult.message;

                            
                            
                            
                            const friendElement = document.createElement('a'); 
                            friendElement.setAttribute('href', `/simple_web/dashboard/user?id=${friend.id}`);     
                        
                            friendElement.innerHTML = `
                                        <img src="/simple_web/assets/images/avatars/${friend.profile_image_url}" 
                                             alt="${friend.username}'s avatar" 
                                             class="friend-avatar">
                                        <span class="friend-username">${friend.username}</span>
                                    `;
                                    friendsListContainer.appendChild(friendElement);
                              
                
                            friendListDiv.appendChild(friendsListContainer);
                           
                        }
                    })
                }
            }

            
      
      
        }
    } catch (error) {
        console.error('Error fetching friends:', error);
    }
}