import sqlite3

def init_db():
    conn = sqlite3.connect('chat.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS chatlog (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_message TEXT,
                    bot_reply TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )''')
    conn.commit()
    conn.close()

def log_message(user, bot):
    conn = sqlite3.connect('chat.db')
    c = conn.cursor()
    c.execute("INSERT INTO chatlog (user_message, bot_reply) VALUES (?, ?)", (user, bot))
    conn.commit()
    conn.close()
