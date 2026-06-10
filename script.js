const gematriaMap = {
    'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
    'י': 10, 'כ': 20, 'ך': 20, 'ל': 30, 'מ': 40, 'ם': 40, 'נ': 50, 'ן': 50,
    'ס': 60, 'ע': 70, 'פ': 80, 'ף': 80, 'צ': 90, 'ץ': 90, 'ק': 100, 'ר': 200,
    'ש': 300, 'ת': 400
};

// Cache DOM elements
const domElements = {};

document.addEventListener("DOMContentLoaded", () => {
    domElements.inputName = document.getElementById('inputName');
    domElements.gender = document.getElementById('gender');
    domElements.gematriaResults = document.getElementById('gematriaResults');
    domElements.complimentsResults = document.getElementById('complimentsResults');
    domElements.loading = document.getElementById('loading');
    domElements.finished = document.getElementById('finished');

    // Add keydown event listener to calculate on Enter
    domElements.inputName.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            calculateGematria();
        }
    });
});

function calculateWordGematria(word) {
    return word.split('').reduce((sum, char) => sum + (gematriaMap[char] || 0), 0);
}

function calculateGematria() {
    const name = domElements.inputName.value.trim();
    const gender = domElements.gender.value;
    if (!name) return;

    const { gematriaResults, complimentsResults, loading, finished } = domElements;

    gematriaResults.innerHTML = "";
    complimentsResults.innerHTML = "";
    loading.style.display = "block";
    finished.style.display = "none";

    let totalGematria = calculateWordGematria(name);
    
    name.split('').forEach(char => {
        if (gematriaMap[char]) {
            const p = document.createElement("p");
            p.textContent = `${char} = ${gematriaMap[char]}`;
            gematriaResults.appendChild(p);
        }
    });

    const totalP = document.createElement("p");
    totalP.innerHTML = `<strong>סך הכל גימטרייה: ${totalGematria}</strong>`;
    gematriaResults.appendChild(totalP);

    const fileToLoad = gender === "male" ? "compliments_male.txt" : "compliments_female.txt";

    fetch(fileToLoad)
        .then(response => response.text())
        .then(text => findMatchingCompliments(text, totalGematria, name))
        .catch(error => {
            console.error("שגיאה בטעינת הקללות", error);
            loading.style.display = "none";
        });
}

function findMatchingCompliments(text, targetGematria, name) {
    const { complimentsResults, loading, finished } = domElements;

    let compliments = text.split("\n").map(line => line.trim()).filter(Boolean);
    let foundCompliments = new Set();
    let sortedCompliments = [];

    // Pre-calculate gematria for all compliments to improve performance
    let complimentGematria = compliments.map(compliment => ({
        text: compliment,
        sum: calculateWordGematria(compliment)
    }));

    // Check single compliments
    for (let {text, sum} of complimentGematria) {
        if (sum === targetGematria && !foundCompliments.has(text) && !foundCompliments.has(reverseWords(text))) {
            foundCompliments.add(text);
            sortedCompliments.push(text);
        }
    }

    // Check combinations with "ו" (and)
    const vavSum = calculateWordGematria("ו");
    for (let i = 0; i < complimentGematria.length; i++) {
        for (let j = i + 1; j < complimentGematria.length; j++) {
            let combinedSum = complimentGematria[i].sum + vavSum + complimentGematria[j].sum;

            if (combinedSum === targetGematria) {
                let combinedCompliment = complimentGematria[i].text + " ו" + complimentGematria[j].text;
                if (!foundCompliments.has(combinedCompliment)) {
                    foundCompliments.add(combinedCompliment);
                    sortedCompliments.push(combinedCompliment);
                }
            }
        }
    }

    sortedCompliments.sort((a, b) => a.localeCompare(b));

    if (sortedCompliments.length === 0) {
        complimentsResults.innerHTML = "<p>לקב איבי קראתיך והנה ברכת ברך לא נמצאו קללות מספקות עבורך</p>";
    } else {
        sortedCompliments.forEach(compliment => {
            addComplimentResult(compliment, name);
        });
    }

    loading.style.display = "none";
    finished.style.display = "block";
}


function addComplimentResult(complimentText, name) {
    const { complimentsResults } = domElements;

    const div = document.createElement("div");
    div.classList.add("compliment-item");

    const textSpan = document.createElement("span");
    textSpan.textContent = complimentText;

    highlightFirstLetter(textSpan, name);

    const detailsDiv = document.createElement("div");
    detailsDiv.style.display = "none";
    detailsDiv.classList.add("gematria-details");
    detailsDiv.innerHTML = generateGematriaDetails(complimentText);

const button = document.createElement("button");
button.textContent = "פירוט גימטרייה";
button.classList.add("info-button");
button.style.backgroundColor = "green";

button.onclick = () => {
    if (detailsDiv.style.display === "none") {
        detailsDiv.style.display = "block";
        button.textContent = "סגור פירוט גימטרייה";
    } else {
        detailsDiv.style.display = "none";
        button.textContent = "פירוט גימטרייה";
    }
};


    div.appendChild(textSpan);
    div.appendChild(button);
    div.appendChild(detailsDiv);
    complimentsResults.appendChild(div);
}

function generateGematriaDetails(compliment) {
    return compliment.split('').map(char => `${char} = ${gematriaMap[char] || 0}`).join('<br>') +
           `<br><strong>סך הכל גימטרייה: ${calculateWordGematria(compliment)}</strong>`;
}

function highlightFirstLetter(element, name) {
    let firstLetter = element.textContent.charAt(0);
    if (name.includes(firstLetter)) {
        element.innerHTML = `<strong>${firstLetter}</strong>${element.textContent.slice(1)}`;
    }
}

function reverseWords(phrase) {
    return phrase.split(' ').reverse().join(' ');
}
