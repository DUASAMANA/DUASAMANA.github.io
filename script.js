const form = document.getElementById('uploadForm');
const wishesContainer = document.getElementById('wishesContainer');

// Handle form submission
form.addEventListener('submit', async (e) => {
e.preventDefault();

const formData = new FormData(form);
const response = await fetch('/upload', {
method: 'POST',
body: formData
});

if (response.ok) {
form.reset(); // Clear form fields on successful submission
fetchWishes(); // Fetch updated wishes after submission
} else {
alert('Failed to upload wish. Please try again.');
}
});

// Function to fetch wishes from server and display them
async function fetchWishes() {
try {
const response = await fetch('/wishes');
if (!response.ok) {
throw new Error('Failed to fetch wishes');
}
const wishes = await response.json();
wishesContainer.innerHTML = ''; // Clear previous wishes
wishes.forEach(wish => {
const wishElement = createWishElement(wish);
wishesContainer.appendChild(wishElement);
});
} catch (error) {
console.error('Error fetching wishes:', error.message);
alert('Failed to fetch wishes. Please try again later.');
}
}

// Function to create HTML elements for each wish
function createWishElement(wish) {
const wishElement = document.createElement('div');
wishElement.classList.add('wish');
wishElement.innerHTML = `
<h3>${wish.name}</h3>
<p>${wish.wish}</p>
<img src="${wish.image_path}" alt="Uploaded Image">
<button class="delete-btn" data-id="${wish.id}">Delete</button>
`;

// Add event listener for delete button
const deleteButton = wishElement.querySelector('.delete-btn');
deleteButton.addEventListener('click', async () => {
const id = wish.id;
const deleteResponse = await fetch(`/delete/${id}`, {
method: 'DELETE'
});

if (deleteResponse.ok) {
fetchWishes(); // Refresh wishes after deletion
} else {
alert('Failed to delete wish. Please try again.');
}
});

return wishElement;
}

// Initial fetch of wishes when page loads
fetchWishes();


// balloons code 

const maxBalloons = 10; // Maximum number of balloons on the screen
const balloonInterval = 3000; // Interval in milliseconds to create balloons

let balloonCount = 0; // Track the current number of balloons

function createBalloon() {
    if (balloonCount >= maxBalloons) return; // Do not create more balloons if the limit is reached

    const balloonWrapper = document.createElement('div');
    balloonWrapper.classList.add('balloon-wrapper');

    const balloon = document.createElement('div');
    balloon.classList.add('balloon');

    const string = document.createElement('div');
    string.classList.add('string');

    // Randomize starting position
    balloonWrapper.style.left = `${Math.random() * 100}vw`;

    // Append balloon and string to wrapper
    balloonWrapper.appendChild(balloon);
    balloonWrapper.appendChild(string);

    // Append to balloon container
    document.querySelector('.balloon-container').appendChild(balloonWrapper);

    balloonCount++; // Increment the balloon count

    // Remove balloon after animation ends and decrement the count
    balloonWrapper.addEventListener('animationend', () => {
        balloonWrapper.remove();
        balloonCount--;
    });
}

// Create balloons at intervals
setInterval(createBalloon, balloonInterval); // Adjust interval as needed
