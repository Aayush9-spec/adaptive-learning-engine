const WEIGHTS = {
    weakness: 0.6,
    exam: 0.3,
    dependency: 0.1,
};

function clamp(value, min, max) {
    if (!Number.isFinite(value)) return min;
    return Math.max(min, Math.min(max, value));
}

export function calculatePriorityScore({
    masteryScore = 0,
    examWeight = 1,
    dependencyUrgency = 0,
}) {
    const safeMastery = clamp(masteryScore, 0, 100);
    const safeExamWeight = clamp(examWeight, 1, 10);
    const safeDependencyUrgency = clamp(dependencyUrgency, 0, 100);

    const priorityScore =
        (100 - safeMastery) * WEIGHTS.weakness +
        safeExamWeight * WEIGHTS.exam +
        safeDependencyUrgency * WEIGHTS.dependency;

    return Number(priorityScore.toFixed(2));
}

export function rankConcepts(concepts = []) {
    return concepts
        .map((concept) => ({
            ...concept,
            priority_score: calculatePriorityScore(concept),
        }))
        .sort((a, b) => b.priority_score - a.priority_score);
}

export function explainPriority({
    masteryScore = 0,
    examWeight = 1,
    dependencyUrgency = 0,
}) {
    const safeMastery = clamp(masteryScore, 0, 100);
    const safeExamWeight = clamp(examWeight, 1, 10);
    const safeDependencyUrgency = clamp(dependencyUrgency, 0, 100);

    return {
        weakness_component: Number(((100 - safeMastery) * WEIGHTS.weakness).toFixed(2)),
        exam_component: Number((safeExamWeight * WEIGHTS.exam).toFixed(2)),
        dependency_component: Number((safeDependencyUrgency * WEIGHTS.dependency).toFixed(2)),
    };
}

export { WEIGHTS };
