const gematriaMap = {
    'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
    'י': 10, 'כ': 20, 'ך': 20, 'ל': 30, 'מ': 40, 'ם': 40, 'נ': 50, 'ן': 50,
    'ס': 60, 'ע': 70, 'פ': 80, 'ף': 80, 'צ': 90, 'ץ': 90, 'ק': 100, 'ר': 200,
    'ש': 300, 'ת': 400
};


function calculateWordGematria(word) {
    return word.split('').reduce((sum, char) => sum + (gematriaMap[char] || 0), 0);
}

function calculateGematria() {
    const name = document.getElementById('inputName').value.trim();
    const gender = document.getElementById('gender').value;
    if (!name) return;

    const gematriaResults = document.getElementById('gematriaResults');
    const complimentsResults = document.getElementById('complimentsResults');
    const loading = document.getElementById('loading');
    const finished = document.getElementById('finished');

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
    const complimentsResults = document.getElementById('complimentsResults');
    const loading = document.getElementById('loading');
    const finished = document.getElementById('finished');

    let compliments = text.split("\n").map(line => line.trim()).filter(Boolean);
    let foundCompliments = new Set();
    let sortedCompliments = [];

    // בדיקה רגילה של קללה בודדת
    for (let compliment of compliments) {
        let sum = calculateWordGematria(compliment);
        if (sum === targetGematria && !foundCompliments.has(compliment) && !foundCompliments.has(reverseWords(compliment))) {
            foundCompliments.add(compliment);
            sortedCompliments.push(compliment);
        }
    }

    // בדיקה עם חיבור של שתי מחמאות בעזרת "ו"
    for (let i = 0; i < compliments.length; i++) {
        for (let j = i + 1; j < compliments.length; j++) {
            let combinedCompliment = compliments[i] + " ו" + compliments[j];
            let combinedSum = calculateWordGematria(compliments[i]) + calculateWordGematria("ו") + calculateWordGematria(compliments[j]);

            if (combinedSum === targetGematria && !foundCompliments.has(combinedCompliment)) {
                foundCompliments.add(combinedCompliment);
                sortedCompliments.push(combinedCompliment);
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
    const complimentsResults = document.getElementById('complimentsResults');

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
