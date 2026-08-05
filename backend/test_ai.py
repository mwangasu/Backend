from feedback.services.gemma import analyze_feedback

result = analyze_feedback(
    "The dispensary has not had malaria medicine for two weeks."
)

print(result)