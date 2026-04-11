# 🚀 QUICK START: Backend Migration Execution

## One-Click Execution Guide

### **Stage 1️⃣: Database Migration**

```bash
# Open MySQL client
mysql -u root -p

# Run the migration script
mysql> source MIGRATION_STUDENT_CLASS_SYNC.sql;

# Or from terminal in one command:
mysql -u root -p < MIGRATION_STUDENT_CLASS_SYNC.sql
```

**Verify it worked:**
```sql
SELECT COUNT(*) as class_count FROM classes;
-- Should now show 6 or 7 classes (was 3)

SELECT COUNT(DISTINCT current_class) FROM students WHERE current_class IS NOT NULL;
-- Shows unique class names students reference
```

---

### **Stage 2️⃣: Restart Backend**

```bash
# In your Java terminal
# 1. Stop current process: Press Ctrl+C

# 2. Clean rebuild (best practice)
cd /home/wambogo/Public/Peculiar-School-Management-System/server
mvn clean install

# 3. Start backend
mvn spring-boot:run

# Wait for: "Started Application in X.XXX seconds"
```

---

### **Stage 3️⃣: Trigger Migration**

**Option A: curl command**
```bash
# In a new terminal
curl -X POST http://localhost:8080/api/students/migrate/link-to-classes

# You should see:
# {"success":true,"message":"Student class migration completed",...}
```

**Option B: Browser**
Navigate to:
```
http://localhost:8080/api/students/migrate/link-to-classes?POST
```
(Most browsers will suggest POST method)

**Option C: Postman**
- Method: `POST`
- URL: `http://localhost:8080/api/students/migrate/link-to-classes`
- Click: Send

---

### **Stage 4️⃣: Check Results**

```bash
# Get detailed report
curl -X GET http://localhost:8080/api/students/migrate/report | json_pp

# Example output:
# {
#   "total": 15,
#   "linked": 9,          ← This should be high
#   "unlinked": 6,        ← Remaining need manual assignment
#   "linkedStudents": [...],
#   "unlinkedStudents": [...]
# }
```

---

### **Stage 5️⃣: Verify in Database**

```sql
-- Check final state
SELECT 
    COUNT(*) as total_students,
    SUM(CASE WHEN school_class_id IS NOT NULL THEN 1 ELSE 0 END) as linked,
    SUM(CASE WHEN school_class_id IS NULL THEN 1 ELSE 0 END) as unlinked
FROM students;

-- Expected:
# total_students | linked | unlinked
# 15             | 9+     | fewer
```

---

## 📊 Expected Migration Results

Based on your current database:

| Metric | Before | After |
|--------|--------|-------|
| Classes | 3 | 6+ |
| Students linked | 0 | 9+ |
| Students unlinked | 15 | 0-6 |
| Database integrity | ❌ | ✅ |

---

## ✅ Success Indicators

- ✅ Migration API returns `"success": true`
- ✅ Linked count > 0
- ✅ Database shows fewer unlinked students
- ✅ `school_class_id` populated for linked students
- ✅ `current_class` synced with `school_class.name`

---

## 🔧 Handle Remaining Unlinked Students

If you still have unlinked students after migration:

```bash
# Link them manually
curl -X PUT http://localhost:8080/api/students/{STUDENT_ID}/link-class/{CLASS_ID}

# Example: Link student 18 to class 20 (S5)
curl -X PUT http://localhost:8080/api/students/18/link-class/20
```

Or use StudentSearch UI: Edit → Select Class → Save

---

## 🧪 Test the Sync in Frontend

1. Open StudentSearch component
2. You should see students with their class names in the "Class" column
3. Student details should show both `currentClass` and `className` matching
4. Class dropdown should be populated with actual classes

---

## 📝 Complete Sequence

```
1. SQL Migration
   ↓
2. Restart Backend
   ↓
3. POST /api/students/migrate/link-to-classes
   ↓
4. GET /api/students/migrate/report
   ↓
5. Verify Database
   ↓
6. Test Frontend
   ↓
✅ DONE!
```

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Migration returns `"linked": 0` | Classes with matching names don't exist. Check SQL script output |
| Still getting NULL `school_class_id` | Student has no `current_class`. Assign manually via API |
| Frontend shows "Unassigned" | Hard refresh browser (Ctrl+Shift+R) |
| Backend won't start | Run `mvn clean install` first |
| MySQL error on SQL script | Make sure you're in the right database. Check `USE psms;` first |

---

## 📞 Need Help?

Check these files for detailed information:
- `MIGRATION_GUIDE.md` - Step-by-step guide with examples
- `BACKEND_REFACTOR_COMPLETE.md` - What was done and why
- `CLASS_SYNC_IMPLEMENTATION_GUIDE.md` - API documentation
- Logs in: `server/logs/` or console output

---

**You're ready! Start with Stage 1️⃣ above👆**
