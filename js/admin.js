import { database, ref, set, get, onValue } from './firebase-config.js';
import {
    loadSchedule, getDance, getOrderedKeys, getPosition,
    getKeyAtPosition, getUpcoming, getTotalDances, getCompetitionName
} from './schedule.js';

const currentDisplay = document.getElementById('adminCurrentDance');
const danceNameDisplay = document.getElementById('adminDanceName');
const danceInfoDisplay = document.getElementById('adminDanceInfo');
const danceDayDisplay = document.getElementById('adminDanceDay');
const competitionNameEl = document.getElementById('competitionName');
const upcomingList = document.getElementById('upcomingList');
const positionIndicator = document.getElementById('positionIndicator');

const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const jumpBtn = document.getElementById('jumpBtn');
const jumpInput = document.getElementById('jumpInput');

let currentKey = null; // The current dance key (string like "1", "55A", etc.)

function updateUI() {
    if (!currentKey) return;

    const data = getDance(currentKey);
    const pos = getPosition(currentKey);
    const total = getTotalDances();

    currentDisplay.textContent = '#' + currentKey;

    if (data) {
        danceNameDisplay.textContent = data.routine_title;
        danceInfoDisplay.textContent = `${data.studio} \u2022 ${data.category}`;
        danceDayDisplay.textContent = `${data.day} \u2022 ${data.time}`;
    } else {
        danceNameDisplay.textContent = 'Unknown Routine';
        danceInfoDisplay.textContent = '';
        danceDayDisplay.textContent = '';
    }

    positionIndicator.textContent = `Dance ${pos + 1} of ${total}`;

    // Disable prev at start, next at end
    prevBtn.disabled = pos <= 0;
    prevBtn.classList.toggle('opacity-30', pos <= 0);
    nextBtn.disabled = pos >= total - 1;
    nextBtn.classList.toggle('opacity-30', pos >= total - 1);

    // Render upcoming
    const upcoming = getUpcoming(currentKey, 5);
    upcomingList.innerHTML = '';

    if (upcoming.length === 0) {
        upcomingList.innerHTML = '<p class="text-gray-600 text-sm text-center py-4">No more dances</p>';
        return;
    }

    upcoming.forEach((dance, i) => {
        const el = document.createElement('div');
        const isNext = i === 0;
        el.className = `rounded-xl p-3 flex items-center gap-3 border transition-colors ${isNext ? 'bg-neonGreen/5 border-neonGreen/20' : 'bg-surface/50 border-white/5'}`;
        el.innerHTML = `
            <div class="w-10 h-10 rounded-lg ${isNext ? 'bg-neonGreen/20' : 'bg-dark'} flex items-center justify-center border ${isNext ? 'border-neonGreen/30' : 'border-gray-800'} shrink-0">
                <span class="text-sm font-black ${isNext ? 'text-neonGreen' : 'text-white'}">${dance.key}</span>
            </div>
            <div class="flex-1 min-w-0">
                <h4 class="font-bold text-sm truncate">${dance.routine_title}</h4>
                <p class="text-xs text-gray-500 truncate">${dance.studio} \u2022 ${dance.category}</p>
            </div>
            <span class="text-[10px] font-bold text-gray-600 shrink-0">${dance.time}</span>
        `;
        upcomingList.appendChild(el);
    });
}

function setCurrentDance(key) {
    key = String(key);
    const pos = getPosition(key);
    if (pos === -1) return; // invalid key, ignore

    currentKey = key;
    updateUI();

    // Push to Firebase
    if (database) {
        const danceRef = ref(database, 'competitions/revel2026/currentDance');
        set(danceRef, currentKey).catch(err => console.error('Firebase update failed:', err));
    }
}

function goNext() {
    const pos = getPosition(currentKey);
    const nextKey = getKeyAtPosition(pos + 1);
    if (nextKey) setCurrentDance(nextKey);
}

function goPrev() {
    const pos = getPosition(currentKey);
    const prevKey = getKeyAtPosition(pos - 1);
    if (prevKey) setCurrentDance(prevKey);
}

function jumpTo() {
    const val = jumpInput.value.trim();
    if (!val) return;

    // Try exact match first
    if (getPosition(val) !== -1) {
        setCurrentDance(val);
        jumpInput.value = '';
        return;
    }

    // Try as a number — find closest
    const num = parseInt(val);
    if (!isNaN(num)) {
        const keys = getOrderedKeys();
        const match = keys.find(k => parseInt(k) === num) || keys.find(k => parseInt(k) >= num);
        if (match) {
            setCurrentDance(match);
            jumpInput.value = '';
        }
    }
}

async function init() {
    await loadSchedule();

    competitionNameEl.textContent = getCompetitionName();

    // Get current state from Firebase or start at first dance
    const firstKey = getKeyAtPosition(0);

    if (database) {
        const danceRef = ref(database, 'competitions/revel2026/currentDance');
        try {
            const snapshot = await get(danceRef);
            if (snapshot.exists() && getPosition(String(snapshot.val())) !== -1) {
                setCurrentDance(snapshot.val());
            } else {
                setCurrentDance(firstKey);
            }
        } catch {
            setCurrentDance(firstKey);
        }
    } else {
        setCurrentDance(firstKey);
    }

    // Button handlers
    nextBtn.addEventListener('click', goNext);
    prevBtn.addEventListener('click', goPrev);
    jumpBtn.addEventListener('click', jumpTo);
    jumpInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') jumpTo();
    });

    // Keyboard shortcuts for speed
    document.addEventListener('keydown', (e) => {
        if (e.target === jumpInput) return; // don't interfere with typing
        if (e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            goNext();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            goPrev();
        }
    });
}

init();
