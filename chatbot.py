from transformers import BlenderbotTokenizer, BlenderbotForConditionalGeneration

# Load Blenderbot model
print("Loading BlenderBot model... (this may take ~100MB download on first run)")
model_name = "facebook/blenderbot-400M-distill"
tokenizer = BlenderbotTokenizer.from_pretrained(model_name)
model = BlenderbotForConditionalGeneration.from_pretrained(model_name)

def get_ai_response(user_input):
    inputs = tokenizer(user_input, return_tensors="pt")
    reply_ids = model.generate(**inputs)
    reply = tokenizer.decode(reply_ids[0], skip_special_tokens=True)
    return reply
