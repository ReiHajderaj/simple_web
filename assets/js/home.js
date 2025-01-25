// Fetch and display recent posts from all users
const loadRecentPosts = async () => {
    // try {
        const response = await fetch('../../api/users/getUserPosts.php'); // Updated API endpoint
        if (response.ok) {
            const data = await response.json();
            if (data.error) {
                window.location.href = '../../auth/sign-in/';
                console.error('Error fetching posts:', data.message);
            } else {
                console.log(data);
                // const postsContainer = document.getElementById('recentPosts');
                // postsContainer.innerHTML = ''; // Clear existing posts
                // // data.posts.forEach(post => {
                // //     const postElement = createPostElement(post);
                // //     postsContainer.appendChild(postElement);
                // });
            }
        }
    // } catch (error) {
    //     console.error('Error loading recent posts:', error);
    // }
};

document.addEventListener('DOMContentLoaded', () => {
    loadRecentPosts();
    const cancelButton = document.getElementById('cancelButton');
    const postTitle = document.getElementById('postTitle');
    const postContent = document.getElementById('postContent');
    const postButton = document.getElementById('postButton');

    cancelButton.addEventListener('click', () => {
        postTitle.value = '';
        postContent.value = '';
    });

    postButton.addEventListener('click', async () => {
        // try {
            const data = {
                title: postTitle.value,
                content: postContent.value
            };
            const response = await fetch('../../api/users/createPost.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                const result = await response.json();
                console.log(result);
                if (result.error) {
                    window.location.href = '../../auth/sign-in/';
                } else {
                    console.log('Post created successfully:', result.message);
                    loadRecentPosts();
                }
            }
        // } catch (error) {
        //     console.error('Error posting:', error);
        // }
    });
});
