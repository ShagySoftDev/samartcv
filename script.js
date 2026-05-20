const cvInput = document.getElementById("cvInput");
const jobInput = document.getElementById("jobInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");
const loadSampleBtn = document.getElementById("loadSampleBtn");

const matchScore = document.getElementById("matchScore");
const scoreTitle = document.getElementById("scoreTitle");
const scoreSummary = document.getElementById("scoreSummary");
const strengthList = document.getElementById("strengthList");
const missingList = document.getElementById("missingList");
const recommendationList = document.getElementById("recommendationList");
const rewriteOutput = document.getElementById("rewriteOutput");
const historyList = document.getElementById("historyList");

let analysisHistory = [];

const skillDictionary = [
    "html", "css", "javascript", "typescript", "react", "vue", "angular",
    "node", "php", "laravel", "python", "django", "flask", "java", "sql",
    "mysql", "postgresql", "mongodb", "excel", "power bi", "tableau",
    "data analysis", "machine learning", "git", "github", "api", "rest",
    "ui", "ux", "figma", "communication", "teamwork", "leadership",
    "problem solving", "project management", "customer service", "marketing",
    "seo", "content writing", "accounting", "research", "statistics"
];

const fillerWords = new Set([
    "and", "the", "for", "with", "from", "this", "that", "will", "are",
    "you", "your", "our", "can", "have", "has", "job", "role", "work",
    "team", "using", "able", "must", "should", "skills", "experience",
    "candidate", "responsibilities", "requirements", "plus", "strong"
]);

const sampleCv = `Aisha Bello
Frontend Developer

Skills: HTML, CSS, JavaScript, React, Git, GitHub, UI design, teamwork, communication.

Experience:
- Built responsive landing pages and dashboards for student projects.
- Developed React components and connected forms to REST APIs.
- Collaborated with classmates using GitHub pull requests.

Education:
BSc Computer Science, University of Lagos.

Projects:
Portfolio website, task management app, and weather dashboard.`;

const sampleJob = `Junior Frontend Developer

We are looking for a frontend developer to build responsive web interfaces.
Requirements include HTML, CSS, JavaScript, React, REST API usage, Git, GitHub, UI/UX awareness, problem solving, and communication skills.
Knowledge of TypeScript and testing is an advantage.`;

function normalizeText(text) {
    return text.toLowerCase().replace(/[^a-z0-9+#.\s-]/g, " ");
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractSkills(text) {
    const normalized = normalizeText(text);
    return skillDictionary.filter(function(skill) {
        const escapedSkill = escapeRegExp(skill);
        const plural = skill === "api" ? "s?" : "";
        const pattern = new RegExp(`(^|\\s)${escapedSkill}${plural}(\\s|\\.|$)`);
        return pattern.test(normalized);
    });
}

function extractKeywords(text) {
    const words = normalizeText(text)
        .split(/\s+/)
        .filter(function(word) {
            return word.length > 3 && !fillerWords.has(word);
        });

    const counts = words.reduce(function(map, word) {
        map[word] = (map[word] || 0) + 1;
        return map;
    }, {});

    return Object.entries(counts)
        .sort(function(a, b) {
            return b[1] - a[1];
        })
        .slice(0, 18)
        .map(function(entry) {
            return entry[0];
        });
}

function detectSections(text) {
    const normalized = normalizeText(text);
    return {
        education: /education|university|college|degree|bsc|msc|diploma/.test(normalized),
        experience: /experience|intern|worked|built|developed|managed|led|created/.test(normalized),
        projects: /project|portfolio|dashboard|application|website|system/.test(normalized),
        certifications: /certification|certificate|certified|course|training/.test(normalized)
    };
}

function getOverlap(source, target) {
    return target.filter(function(item) {
        return source.includes(item);
    });
}

function listItems(element, items) {
    element.innerHTML = "";
    items.forEach(function(item) {
        const li = document.createElement("li");
        li.textContent = item;
        element.appendChild(li);
    });
}

function getScoreLabel(score) {
    if (score >= 80) {
        return "Excellent role alignment";
    }
    if (score >= 65) {
        return "Good match with a few gaps";
    }
    if (score >= 45) {
        return "Moderate match needing improvement";
    }
    return "Low match requiring targeted rewrite";
}

function buildRewrite(cvSkills, matchedSkills, missingSkills, jobKeywords, sections) {
    const strongestSkills = matchedSkills.slice(0, 6).join(", ") || cvSkills.slice(0, 6).join(", ") || "relevant professional skills";
    const targetKeywords = jobKeywords.slice(0, 6).join(", ") || "the target role";
    const missingLine = missingSkills.length ? `Add evidence for: ${missingSkills.slice(0, 5).join(", ")}.` : "The CV already covers the main listed skill requirements.";
    const educationLine = sections.education ? "Education section is present and should be kept concise." : "Add education details, including qualification, institution, and dates.";
    const projectLine = sections.projects ? "Keep project examples and attach measurable outcomes." : "Add one or two role-relevant projects with tools used and results achieved.";

    return `Professional Summary
Motivated candidate with experience in ${strongestSkills}. Prepared to contribute to roles requiring ${targetKeywords}, with a focus on practical delivery, clear communication, and continuous improvement.

Targeted CV Bullets
- Highlight achievements that prove ${matchedSkills.slice(0, 3).join(", ") || "the strongest job requirements"}.
- Use the exact job keywords naturally in the skills, experience, and project sections.
- ${missingLine}
- ${educationLine}
- ${projectLine}`;
}

function analyzeMatch() {
    const cvText = cvInput.value.trim();
    const jobText = jobInput.value.trim();

    if (!cvText || !jobText) {
        alert("Please paste both a CV and a job description before analyzing.");
        return;
    }

    const cvSkills = extractSkills(cvText);
    const jobSkills = extractSkills(jobText);
    const cvKeywords = extractKeywords(cvText);
    const jobKeywords = extractKeywords(jobText);
    const matchedSkills = getOverlap(cvSkills, jobSkills);
    const matchedKeywords = getOverlap(cvKeywords, jobKeywords);
    const missingSkills = jobSkills.filter(function(skill) {
        return !cvSkills.includes(skill);
    });
    const sections = detectSections(cvText);

    const skillScore = jobSkills.length ? (matchedSkills.length / jobSkills.length) * 55 : 20;
    const keywordScore = jobKeywords.length ? Math.min((matchedKeywords.length / jobKeywords.length) * 25, 25) : 10;
    const sectionScore = Object.values(sections).filter(Boolean).length * 5;
    const finalScore = Math.min(Math.round(skillScore + keywordScore + sectionScore), 98);

    const strengths = [
        matchedSkills.length ? `Relevant skills found: ${matchedSkills.join(", ")}.` : "The CV has a readable structure, but direct job skill evidence is limited.",
        matchedKeywords.length ? `Shared keywords include ${matchedKeywords.slice(0, 8).join(", ")}.` : "The CV can be improved by adding more wording from the job description.",
        sections.experience ? "Experience or project delivery is visible in the CV." : "The CV needs a clearer experience section."
    ];

    const recommendations = [
        "Place the most relevant skills near the top of the CV.",
        "Rewrite experience bullets to show action, tool used, and result.",
        "Mirror important job description keywords without exaggerating experience.",
        missingSkills.length ? `Prioritize learning or evidencing ${missingSkills.slice(0, 4).join(", ")}.` : "Keep the CV focused and quantify achievements where possible."
    ];

    scoreTitle.textContent = getScoreLabel(finalScore);
    matchScore.textContent = `${finalScore}%`;
    scoreSummary.textContent = `The assistant compared technical skills, keywords, experience signals, and education/project sections using grounded prompt-style analysis.`;
    listItems(strengthList, strengths);
    listItems(missingList, missingSkills.length ? missingSkills : ["No major missing skills detected from the provided job description."]);
    listItems(recommendationList, recommendations);
    rewriteOutput.textContent = buildRewrite(cvSkills, matchedSkills, missingSkills, jobKeywords, sections);

    updateHistory({
        score: finalScore,
        title: getScoreLabel(finalScore),
        matched: matchedSkills.length,
        missing: missingSkills.length
    });
}

function updateHistory(record) {
    analysisHistory.unshift(record);
    analysisHistory = analysisHistory.slice(0, 5);
    historyList.innerHTML = "";

    analysisHistory.forEach(function(item) {
        const row = document.createElement("div");
        row.className = "history-item";
        row.innerHTML = `
            <div>
                <strong>${item.title}</strong>
                <p>${item.matched} matched skill(s), ${item.missing} missing skill(s)</p>
            </div>
            <span>${item.score}%</span>
        `;
        historyList.appendChild(row);
    });
}

loadSampleBtn.addEventListener("click", function() {
    cvInput.value = sampleCv;
    jobInput.value = sampleJob;
});

clearBtn.addEventListener("click", function() {
    cvInput.value = "";
    jobInput.value = "";
    matchScore.textContent = "0%";
    scoreTitle.textContent = "Ready for analysis";
    scoreSummary.textContent = "Paste a CV and job description, then run the assistant to see a professional review.";
    listItems(strengthList, []);
    listItems(missingList, []);
    listItems(recommendationList, []);
    rewriteOutput.textContent = "Your rewritten CV summary and bullet points will appear here.";
});

analyzeBtn.addEventListener("click", analyzeMatch);
