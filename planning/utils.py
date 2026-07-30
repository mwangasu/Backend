import re
from collections import Counter


def infer_sentiment(text: str) -> str:
    lowered = text.lower()
    positive_words = {'good', 'great', 'support', 'improve', 'hope', 'excellent', 'benefit', 'happy', 'invest'}
    negative_words = {'bad', 'poor', 'concern', 'problem', 'issue', 'worry', 'delay', 'fail', 'angry', 'need'}

    positive_hits = sum(1 for word in positive_words if word in lowered)
    negative_hits = sum(1 for word in negative_words if word in lowered)

    if negative_hits > positive_hits:
        return 'negative'
    if positive_hits > negative_hits:
        return 'positive'
    return 'neutral'


def build_report(submission, feedback_items):
    feedback_texts = [item.feedback_text for item in feedback_items]
    combined_feedback = '\n'.join(feedback_texts) if feedback_texts else 'No feedback available.'

    topic_matches = Counter(re.findall(r"\b[a-zA-Z]{4,}\b", combined_feedback.lower()))
    top_topics = [topic for topic, _ in topic_matches.most_common(5)]

    summary = (
        f"For {submission.constituency_name}, the proposed focus on {submission.priority_area} "
        f"aims to support {submission.development_goal}. "
        f"The budget estimate is {submission.budget_estimate}."
    )

    return {
        'summary': summary,
        'top_topics': top_topics,
        'feedback_count': len(feedback_items),
        'sentiment_breakdown': {
            'positive': sum(1 for item in feedback_items if item.sentiment == 'positive'),
            'neutral': sum(1 for item in feedback_items if item.sentiment == 'neutral'),
            'negative': sum(1 for item in feedback_items if item.sentiment == 'negative'),
        },
    }
