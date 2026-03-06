import { database, ref, set, onValue } from './firebase-config.js';
import { loadSchedule, getDance, getPosition } from './schedule.js';

const currentDisplay = document.getElementById('currentDanceDisplay');
const currentTitle = document.getElementById('currentDanceTitle');
const currentInfo = document.getElementById('currentDanceInfo');
const detailsContainer = document.getElementById('currentDanceDetails');
const updateInput = document.getElementById('quickUpdateInput');
const updateBtn = document.getElementById('quickUpdateBtn');

async function updateUI(key) {
    if (!key) return;

    currentDisplay.textContent = '#' + key;

    const data = getDance(key);
    if (data) {
        currentTitle.textContent = data.routine_title;
        currentInfo.textContent = `${data.studio} \u2022 ${data.category}`;
        detailsContainer.classList.remove('hidden');
    } else {
        detailsContainer.classList.add('hidden');
    }
}

function pushUpdate() {
    const val = updateInput.value.trim().toUpperCase();
    if (!val) return;

    // Validate if it's a valid dance (exact or number-approx)
    if (getPosition(val) === -1) {
        // Just a basic check for now - if it's not in the list, flash red
        updateInput.classList.add('border-red-500');
        setTimeout(() => updateInput.classList.remove('border-red-500'), 1000);
        return;
    }

    if (database) {
        const danceRef = ref(database, 'competitions/revel2026/currentDance');
        set(danceRef, val)
            .then(() => {
                updateInput.value = '';
                // Optional: success flash
                updateInput.classList.add('border-neonGreen');
                setTimeout(() => updateInput.classList.remove('border-neonGreen'), 500);
            })
            .catch(err => console.error('Firebase update failed:', err));
    } else {
        // Fallback for demo
        updateUI(val);
        updateInput.value = '';
    }
}

async function init() {
    await loadSchedule();

    if (database) {
        const danceRef = ref(database, 'competitions/revel2026/currentDance');
        onValue(danceRef, (snapshot) => {
            const val = snapshot.val();
            if (val) updateUI(val);
        });
    } else {
        updateUI('1');
    }

    updateBtn.addEventListener('click', pushUpdate);
    updateInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') pushUpdate();
    });
}

init();
