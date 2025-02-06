const Sidebar = () => {
    const sidebar = document.querySelector('.side_nav');


    sidebar.innerHTML += `
        <div class="span_nav">Side Navigator</div>
                
                <div class="snav_items">
                    <div class="item">
                        <div  class="item_banner" 
                        
                        onclick="goHome()">Home</div>
                        
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
                            <input type="text" id="friendSelect" placeholder="Search by name or email">
                            <div id="friendsDropdown" class="friends-dropdown"></div>
                            <button id="add_friend_btn" onclick="sendFriendRequest(friendSelect.value)">Send Request</button>
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

const goSettings = () => {
    window.location.href = '/simple_web/dashboard/settings'
}

const goHome = () => {
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

    try {
        const request = await fetch('/simple_web/api/users/getNotifications.php');
        if (request.ok) {
            const response = await request.json();

            if (response.error) {
                console.error('Error populating notifications:', response.message);
                window.location.href = '/simple_web/auth/sign-in';
            }
            else {
                // console.log(response);
                
                response.forEach(async notification => {
                    const notificationDiv = document.createElement('div');
                    // console.log(notification);
                    

                    notificationDiv.classList.add('friend-request-notification');

                    const getNameRequest = await fetch('/simple_web/api/users/getUserId.php', {
                        method: 'POST',
                        body: JSON.stringify({ id: notification.source_id }),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    if (getNameRequest.ok) {
                        const nameResponse = await getNameRequest.json();
                        // console.log(nameResponse);
                        
                        if (nameResponse.status == 201) {
                            if (notification.type == 'friend_request') {
                                notificationDiv.innerHTML = `
                                <span class="request-text">Friend request from ${nameResponse.message.username}</span>
                                <div class="request-actions">
                                    <button class="request-btn accept" onclick="handleFriendRequest(${notification.source_id}, 'accept', event)"></button>
                                    <button class="request-btn reject" onclick="handleFriendRequest(${notification.source_id}, 'reject', event)"></button>
                                </div>
                            `;
                            } else if (notification.type == 'like') {
                                notificationDiv.innerHTML = `
                                    <span class="request-text" onclick="goToPost(${notification.post_id}, ${notification.id})"> ${nameResponse.message.username} liked your post</span>
                                `;
                            } else if (notification.type == 'comment') {
                                notificationDiv.innerHTML = `
                                    <span class="request-text" onclick="goToPost(${notification.post_id}, ${notification.id})"> ${nameResponse.message.username} commented on your post</span>
                                `;
                            } else if(notification.type == 'message'){
                                notificationDiv.innerHTML = `
                                    <span class="request-text" onclick="openChat(${notification.source_id}, ${notification.id})"> ${nameResponse.message.username} sent you a message</span>
                                `;
                            }

                        }

                    }
                    // console.log(notificationDiv);
                    // console.log(notifications);
                    
                    
                    notifications.appendChild(notificationDiv);
                });
            }
        }
    } catch (error) {
        console.error('Error populating notifications:', error);
    }
}

const openChat = async (friendId, notificationId) => {
    const request = await fetch('/simple_web/api/users/removeNotification.php', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notification_id: notificationId })
    });
    if (request.ok) {
        const response = await request.json();
        // console.log(response);
        if(response.status == 201){
            window.location.href = `/simple_web/dashboard/messages?id=${friendId}`;
        }
    }
}

const goToPost = async (postId, notificationId) => {
    // console.log(notificationId);
    
    const request = await fetch('/simple_web/api/users/removeNotification.php', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notification_id: notificationId })
    });
    if (request.ok) {
        const response = await request.json();
        // console.log(response);
        if(response.status == 201){
            window.location.href = `/simple_web/dashboard/home?id=${postId}`;
        }
    }
    
}


const populateFriendsList = async () => {
    const friendSelect = document.querySelector('#friendSelect');
    const friendsDropdown = document.querySelector('#friendsDropdown');
    let users = [];

    try {
        const request = await fetch('/simple_web/api/users/getUsers.php');
        if (request.ok) {
            const response = await request.json();
            if (response.error) {
                console.error('Error populating friends list:', response.message);
                window.location.href = '/simple_web/auth/sign-in';
            } else {
                users = response;
                
                // Add input event listener
                friendSelect.addEventListener('input', (e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    const filteredUsers = users.filter(user => 
                        user.username.toLowerCase().includes(searchTerm) || 
                        user.email.toLowerCase().includes(searchTerm)
                    );
                    
                    // Clear previous results
                    friendsDropdown.innerHTML = '';
                    
                    // Show dropdown if there are matches and input isn't empty
                    if (searchTerm && filteredUsers.length > 0) {
                        friendsDropdown.style.display = 'block';
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
                                friendSelect.value = user.username;
                                friendsDropdown.style.display = 'none';
                            });
                            friendsDropdown.appendChild(option);
                        });
                    } else {
                        friendsDropdown.style.display = 'none';
                    }
                });

                // Close dropdown when clicking outside
                document.addEventListener('click', (e) => {
                    if (!friendSelect.contains(e.target) && !friendsDropdown.contains(e.target)) {
                        friendsDropdown.style.display = 'none';
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error populating friends list:', error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    Sidebar();
    populateFriendsList();

});

const sendFriendRequest = async (username) => {
    
    

    try {
        const request = await fetch('/simple_web/api/users/sendFriendRequest.php', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username
            })
        })

        if (request.ok) {
            const response = await request.json();
            // console.log(response);
            
            if (response.error) {
                console.error('Error populating friends list:', response.message);
                window.location.href = '/simple_web/auth/sign-in';
            } else if (response.status === 201) {
                // console.log(response);
                givePopup(response.message, 'success');
            } else {

                showPopup(response.message, 'error');
            }
        }
    } catch (error) {
        console.error("Fetching error: ", error);

    }
    
}

const handleFriendRequest = async (sender, type, e) => {
    try {



        const request = await fetch('/simple_web/api/users/handleFriend.php', {
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

        if (request.ok) {
            const response = await request.json()
            // console.log(response);

            if (response.error) {
                console.error('Error on handleFriendRequest:', response.message);
                window.location.href = '/simple_web/auth/sign-in';
            } else if (response.status == 201) {
                // console.log(response);
                e.target.parentElement.parentElement.remove();
            } else {
                showPopup(response.message, 'error');
            }
        }
    } catch (error) {
        console.error('Fetching Error: ', error);

    }
}


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
            else if (response.status = 201) {
                const friendsListContainer = document.createElement('div');
                friendsListContainer.classList.add('friends-list', 'active');

                if (response.message.length === 0) {
                    friendsListContainer.innerHTML = '<p class="no-friends">No friends added yet</p>';
                } else {
                    response.message.forEach(async friendId => {
                        const detailResponse = await fetch('/simple_web/api/users/getUserId.php', {
                            method: 'POST',
                            body: JSON.stringify({ id: friendId }),
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        })

                        if (detailResponse.ok) {
                            const detailResult = await detailResponse.json();
                            const friend = detailResult.message;

                            
                            friendsListContainer.innerHTML += `
<div class = 'friend-container'>
                            <a href="/simple_web/dashboard/user?id=${friend.id}">
                                <img src="/simple_web/assets/images/avatars/${friend.profile_image_url}" 
                                             alt="${friend.username}'s avatar" 
                                             class="friend-avatar">
                                        <span class="friend-username">${friend.username}</span>
                            </a>
                            <button class="message-friend" onclick="window.location.href='/simple_web/dashboard/messages?id=${friend.id}'">Message</button>
                            <button class="remove-friend" onclick="removeFriend(${friend.id}, event)">Remove </button>
             </div>               `;
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

const givePopup = (message, type) => {
    const popup = document.createElement('div');
    popup.classList.add('popup', type);
    popup.textContent = message;
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 3000);
};

const removeFriend = async (friendId, e) => {
    // console.log(friendId);
    const request = await fetch('/simple_web/api/users/removeFriend.php', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ friendId })
    });
    if (request.ok) {
        const response = await request.json();
        // console.log(response);
        
        if(response.status == 201){
            givePopup(response.message, 'success');
            getFriends(e);
        }
        else{
            givePopup(response.message, 'error');
        }
    }
}
