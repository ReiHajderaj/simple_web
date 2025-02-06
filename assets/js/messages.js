// Initialize chat functionality
const initializeChat = async () => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('id');
        if (!userId) return;

        const userInfo = await getIdUser(userId);
        if (!userInfo) return;

        updateChatHeader(userInfo);
        await loadMessages(userId);
        setupMessageInput(userId);
        
    } catch (error) {
        console.error('Error initializing chat:', error);
    }
};

const getIdUser = async (userId) => {
    const response = await fetch('../../api/users/getUserId.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId })
    });
    if (response.ok) {
        const data = await response.json();
        if (data.error) {
            window.location.href = '../../auth/sign-in/';
            return null;
        }
        return data.message;
    }
    console.error('Failed to fetch current user.');
    return null;
};

const updateChatHeader = (userInfo) => {
    const profilePic = document.querySelector('#chatProfilePic');
    profilePic.src = `../../assets/images/avatars/${userInfo.profile_image_url}`;
    
    document.querySelector('#chatUsername').outerHTML = `<a href="/simple_web/dashboard/user?id=${userInfo.id}">${userInfo.username}</a>`;
};

const loadMessages = async (userId) => {
    try {
        const response = await fetch('../../api/users/getMessages.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ friend_id: userId })
        });
        
        if (response.ok) {
            const data = await response.json();
            // console.log(data);
            
            if (data.error) {
                window.location.href = '../../auth/sign-in/';
                return;
            } else if (data.status == 403) {
                window.location.href = '../../dashboard/';
                return;
            } else {
                // console.log(data.messages);
                
                displayMessages(data.messages, userId);
            }
           
        }
    } catch (error) {
        console.error('Error loading messages:', error);
    }
};

const displayMessages = (messages, userId) => {
    const container = document.getElementById('messagesContainer');
    container.innerHTML = '';

    // console.log(messages);
    

    if(messages.length > 0){
        // console.log(messages.length);
        
        messages.forEach(message => {
            // console.log(message);
            
            const messageElement = createMessageElement(message, userId);
            // console.log(messageElement);
            
            // console.log('hello');
            
            container.appendChild(messageElement);
        });
        
        // Scroll to bottom of messages
        container.scrollTop = container.scrollHeight;
    }

    
};

const createMessageElement = (message, userId) => {
    const messageDiv = document.createElement('div');
    // console.log(message.sender_id, userId);
    
    messageDiv.classList.add('message', message.sender_id == userId ? 'received' : 'sent');
    
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message_content');
    contentDiv.textContent = message.content;
    
    const timeDiv = document.createElement('div');
    timeDiv.classList.add('message_time');
    timeDiv.textContent = formatDate(message.created_at);
    
    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timeDiv);
    
    return messageDiv;
};

const setupMessageInput = (recipientId) => {
    const input = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendMessage');

    const sendMessage = async () => {
        const content = input.value.trim();
        if (!content) return;



        try {
            const response = await fetch('../../api/users/sendMessage.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipient_id: recipientId,
                    content: content
                })
            });

            if (response.ok) {
                const result = await response.json();
                // console.log(result);
                
                if (result.error) {
                    window.location.href = '../../auth/sign-in/';
                } else {
                    input.value = '';
                    await loadMessages(recipientId);
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    sendButton.onclick = sendMessage;
    input.onkeypress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit'
    });
};

document.addEventListener('DOMContentLoaded', initializeChat);

