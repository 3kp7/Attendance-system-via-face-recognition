from database import engine, Base
import models
# Create all tables
models.Base.metadata.create_all(bind=engine)

print("✅ Tables created successfully in PostgreSQL!")
