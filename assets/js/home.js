// Fetch and display recent posts from all users
const loadRecentPosts = async () => {
    try {
        const userInfo = await getCurrentUser();
        if (!userInfo) return;

        updateUserProfile(userInfo);

        const posts = await fetchUserPosts();
        if (posts) {
            await displayPosts(posts);
        }

        // Check if URL has 'id' parameter after posts are loaded
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');
        if (postId) {
            // Construct the element ID based on the post ID
            const postElement = document.getElementById(`post_${postId}`);
            // console.log(postElement);
            
            if (postElement) {
                // Scroll to the post smoothly
                postElement.scrollIntoView({ behavior: 'smooth' });

                // Optionally, highlight the post for better visibility
                postElement.classList.add('highlight');
                setTimeout(() => {
                    postElement.classList.remove('highlight');
                }, 3000);
            } else {
                console.warn(`Post with ID ${postId} not found.`);
            }
        }
    } catch (error) {
        console.error('Error loading recent posts:', error);
    }
};

const getCurrentUser = async () => {
    const response = await fetch('../../api/users/getCurrentUser.php');
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

const updateUserProfile = (userInfo) => {
    const image = document.querySelector('#profileImage');
    image.src = `../../assets/images/avatars/${userInfo.profile_image_url}`;

    document.querySelector('#username').textContent = userInfo.username;
    document.querySelector('#bio').textContent = userInfo.bio;
};

const fetchUserPosts = async () => {
    const response = await fetch('../../api/users/getUserPosts.php');
    if (response.ok) {
        const data = await response.json();
        if (data.error) {
            window.location.href = '../../auth/sign-in/';
            console.error('Error fetching posts:', data.message);
            return null;
        }
        return data.posts;
    }
    console.error('Failed to fetch user posts.');
    return null;
};

const displayPosts = async (posts) => {
    const postsContainer = document.getElementById('recentPosts');
    postsContainer.innerHTML = ''; // Clear existing posts

    for (const post of posts) {
        const postElement = await createPostElement(post);
        postsContainer.appendChild(postElement);
    }
};

const createPostElement = async (post) => {
    try {
        const userInfo = await getUserInfo(post.user_id);

        const formattedDate = formatDate(post.created_at);

        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.innerHTML = `
            <div id="post_${post.id}" class="post_top">
                <div class="post_author_photo">
                    <img src="../../assets/images/avatars/${userInfo.profile_image_url}" alt="Profile Picture" class="profileImage">
                </div>
                <div class="post_info">
                    <div class="post_author_name">${userInfo.username}</div>
                    <div class="post_date">${formattedDate}</div>
                </div>
                <div class="post_close" onclick='removePost(event)'><i class="fas fa-close"></i></div>
            </div>
            <div class="post_content">
                <span class="post_heading">${sanitizeHTML(post.title)}</span><br>
                <p>${sanitizeHTML(post.content)}</p><br>
                <div class="post_image">
                    ${post.image_url ? `<img src="../../assets/images/posts/${post.image_url}" alt="Post Image">` : ''}
                </div>
            </div>
            <div class="post_bottom">
                <div><i class="fas fa-thumbs-up"></i> <span 
                class="likeCount" onclick="likePost(${post.id}, event)">Likes</span></div>
                <div><i class="fas fa-comment"></i> <span 
                class="commentCount" onclick="showComments(${post.id}, event)">Comments</span></div>
            </div>
            <div class="post_comments">
                <div class="post_comment_input">
                    <input type="text" class="commentInput" placeholder="Add a comment">
                    <button onclick="addComment(${post.id}, event)">Add</button>
                </div>
                <div class="post_comments_list"></div>
            </div>
        `;
        reload(post.id);
        return postElement;
    } catch (error) {
        console.error('Error creating post element:', error);
        return document.createElement('div'); // Return empty div on error
    }
};

const getUserInfo = async (userId) => {
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
    console.error('Failed to fetch user info.');
    return null;
};

const getLikeCount = async (postId) => {
    const response = await fetch('../../api/users/getLikeCount.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId })
    });
    if (response.ok) {
        const data = await response.json();
        return data.message;
    }
    return 0;
};

const getCommentCount = async (postId) => {
    const response = await fetch('../../api/users/getCommentCount.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId })
    });
    if (response.ok) {
        const data = await response.json();
        return data.message;
    }
    return 0;
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

const sanitizeHTML = (str) => {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
};

const removePost = (e) => {
    e.target.closest('.post').remove();
};

const likePost = async (postId) => {
    try {
        const response = await fetch('../../api/users/likePost.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post_id: postId })
        });
        if (response.ok) {
            const result = await response.json();
            if (result.error) {
                window.location.href = '../../auth/sign-in/';
            } else {
                showPopup(result.message, 'success');
                reload(postId);
            }
        }
    } catch (error) {
        console.error('Error liking post:', error);
    }
};

const reload = async (postId) => {
    const comment = await getCommentCount(postId);
    const like = await getLikeCount(postId);

    const post = document.querySelector(`#post_${postId}`);
    const likeCount = post.parentElement.querySelector('.likeCount');
    const commentCount = post.parentElement.querySelector('.commentCount');
    // console.log(post);
    
    
    // console.log(commentCount);
    
    likeCount.textContent = `${like} Likes`;
    commentCount.textContent = `${comment} Comments`;
    // console.log(comment);
    // console.log(like);
    
}

const addComment = async (postId, e) => {
    try {
        const commentInput = e.target.closest('.post_comments').querySelector('.commentInput');
        const comment = commentInput.value.trim();
        if (!comment) return;

        const response = await fetch('../../api/users/addComment.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post_id: postId, comment })
        });
        if (response.ok) {
            const result = await response.json();
            if (result.error) {
                window.location.href = '../../auth/sign-in/';
            } else {
                commentInput.value = '';
                showPopup(result.message, result.status === 201 ? 'success' : 'error');
                showComments(postId, e);
                reload(postId);
            }
        }
    } catch (error) {
        console.error('Error adding comment:', error);
    }
};

const showComments = async (postId, e) => {
    try {
        const commentsSection = e.target.closest('.post').querySelector('.post_comments');
        const commentsContainer = commentsSection.querySelector('.post_comments_list');
        commentsSection.classList.toggle('active');

        if (commentsSection.classList.contains('active')) {
            commentsContainer.innerHTML = '';
            const response = await fetch('../../api/users/getPostComments.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ post_id: postId })
            });
            if (response.ok) {
                const result = await response.json();
                if (result.error) {
                    window.location.href = '../../auth/sign-in/';
                } else {
                    if (result.message.length > 0) {
                        for (const comment of result.message) {
                            const userInfo = await getUserInfo(comment.user_id);
                            if (userInfo) {
                                const commentElement = createCommentElement(comment, userInfo);
                                commentsContainer.appendChild(commentElement);
                            }
                        }
                    } else {
                        commentsContainer.textContent = "No comments yet";
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error showing comments:', error);
    }
};

const createCommentElement = (comment, userInfo) => {
    const commentElement = document.createElement('div');
    commentElement.classList.add('post_comment');

    const authorDiv = document.createElement('div');
    authorDiv.classList.add('comment_author');
    const authorImg = document.createElement('img');
    authorImg.src = userInfo.profile_picture || `../../assets/images/avatars/${userInfo.profile_image_url}`;
    authorImg.alt = `${userInfo.username}'s profile picture`;
    authorDiv.appendChild(authorImg);

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('comment_content');

    const headerDiv = document.createElement('div');
    headerDiv.classList.add('comment_header');

    const authorName = document.createElement('span');
    authorName.classList.add('comment_author_name');
    authorName.textContent = userInfo.username;

    const timestamp = document.createElement('span');
    timestamp.classList.add('comment_timestamp');
    timestamp.textContent = new Date(comment.created_at).toLocaleString();

    headerDiv.appendChild(authorName);
    headerDiv.appendChild(timestamp);

    const commentText = document.createElement('p');
    commentText.classList.add('comment_text');
    commentText.innerHTML = sanitizeHTML(comment.content);

    contentDiv.appendChild(headerDiv);
    contentDiv.appendChild(commentText);

    commentElement.appendChild(authorDiv);
    commentElement.appendChild(contentDiv);

    return commentElement;
};

const showPopup = (message, type) => {
    const popup = document.createElement('div');
    popup.classList.add('popup', type);
    popup.textContent = message;
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 3000);
};

document.addEventListener('DOMContentLoaded', () => {
    loadRecentPosts();

    const elements = {
        cancelButton: document.getElementById('cancelButton'),
        postTitle: document.getElementById('postTitle'),
        postContent: document.getElementById('postContent'),
        postButton: document.getElementById('postButton'),
        postImage: document.getElementById('postImage'),
        imagePreview: document.getElementById('imagePreview'),
        imagePreviewContainer: document.getElementById('imagePreviewContainer')
    };

    // Handle image preview
    elements.postImage.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const validImageTypes = ['image/gif', 'image/jpeg', 'image/png', 'image/webp'];
            if (!validImageTypes.includes(file.type)) {
                alert('Please select a valid image file (JPEG, PNG, GIF, WEBP).');
                elements.postImage.value = ''; // Clear the invalid file
                elements.imagePreviewContainer.style.display = 'none';
                elements.imagePreview.src = '#';
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                elements.imagePreview.src = e.target.result;
                elements.imagePreviewContainer.style.display = 'flex';
            };
            reader.readAsDataURL(file);
        } else {
            elements.imagePreview.src = '#';
            elements.imagePreviewContainer.style.display = 'none';
        }
    });

    // Handle form reset on Cancel
    elements.cancelButton.addEventListener('click', () => {
        elements.postTitle.value = '';
        elements.postContent.value = '';
        elements.postImage.value = '';
        elements.imagePreview.src = '#';
        elements.imagePreviewContainer.style.display = 'none';
    });

    // Handle post submission
    elements.postButton.addEventListener('click', async () => {
        try {
            const formData = new FormData();
            formData.append('title', elements.postTitle.value.trim());
            formData.append('content', elements.postContent.value.trim());

            const file = elements.postImage.files[0];
            if (file) {
                formData.append('image', file);
            }

            const response = await fetch('../../api/users/createPost.php', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();

                if (result.error) {
                    window.location.href = '../../auth/sign-in/';
                } else {
                    // Clear the form
                    elements.postTitle.value = '';
                    elements.postContent.value = '';
                    elements.postImage.value = '';
                    elements.imagePreview.src = '#';
                    elements.imagePreviewContainer.style.display = 'none';
                    // Reload posts
                    loadRecentPosts();
                }
            } else {
                console.error('Failed to create post. Server responded with status:', response.status);
            }
        } catch (error) {
            console.error('Error posting:', error);
        }
    });
});

