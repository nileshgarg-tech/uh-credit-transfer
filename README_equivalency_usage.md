# UH Transfer Credit Equivalency Data

This directory contains structured equivalency data for University of Houston transfer credit evaluation.

## Files Created

### 1. `ap_equivalency.json`
Contains AP exam score to UH course equivalencies in the format:
```json
{
  "ExamName|Score": {
    "uhCourse": "UH course code(s)",
    "credits": number,
    "description": "Course description"
  }
}
```

**Example:**
```json
{
  "Calculus AB|4": {
    "uhCourse": "MATH 1431",
    "credits": 4,
    "description": "Calculus I"
  }
}
```

### 2. `tccns_equivalency.json`  
Contains Texas Common Course Numbering System (TCCNS) to UH course equivalencies:
```json
{
  "TCCNS_Code": {
    "uhCourse": "UH course code(s)",
    "credits": number,
    "description": "Course description"
  }
}
```

**Example:**
```json
{
  "ENGL 1301": {
    "uhCourse": "ENGL 1303",
    "credits": 3,
    "description": "First Year Writing I"
  }
}
```

## Integration with Document Processing Pipeline

### Stage 1: Document Extraction (Already Working)
```
PDF Upload → Azure OCR → GPT-4 → Structured Course JSON
```

### Stage 2: Transfer Credit Evaluation (Next Step)
```javascript
// Load equivalency tables
const apEquivalency = require('./ap_equivalency.json');
const tccnsEquivalency = require('./tccns_equivalency.json');

// Process extracted courses
function evaluateTransferCredit(extractedCourses) {
  const transferEvaluation = extractedCourses.map(course => {
    if (course.type === 'AP') {
      const key = `${course.exam}|${course.grade}`;
      const match = apEquivalency[key];
      return {
        ...course,
        uhEquivalent: match?.uhCourse || 'No equivalent found',
        uhCredits: match?.credits || 0,
        transferable: !!match
      };
    } else if (course.type === 'CC') {
      const match = tccnsEquivalency[course.exam];
      return {
        ...course,
        uhEquivalent: match?.uhCourse || 'No equivalent found',
        uhCredits: match?.credits || 0,
        transferable: !!match
      };
    }
  });
  
  return transferEvaluation;
}
```

## GPT Prompt Integration

You can now enhance your document processing prompts to include equivalency matching:

```javascript
const systemPrompt = `
You are a UH transfer credit evaluator. Given extracted course data and equivalency tables, 
determine which courses transfer to UH and how many credits they're worth.

AP Equivalency Rules: ${JSON.stringify(apEquivalency)}
TCCNS Equivalency Rules: ${JSON.stringify(tccnsEquivalency)}

For each course, return:
- Original course information
- UH equivalent course(s)
- Transferable credit hours
- Transfer status (accepted/not accepted/pending review)
`;
```

## Data Sources

- **AP Data**: Official UH Credit by Examination tables and AP equivalency charts
- **TCCNS Data**: Texas Common Course Numbering System official equivalencies as recognized by UH
- **Coverage**: ~50 AP exam/score combinations, ~60 community college course codes

## Usage in API

Add a new endpoint for transfer evaluation:

```javascript
app.post('/api/evaluate-transfer-credit', async (req, res) => {
  try {
    const { extractedCourses } = req.body;
    
    // Apply equivalency matching
    const evaluatedCourses = evaluateTransferCredit(extractedCourses);
    
    // Calculate totals
    const totalCredits = evaluatedCourses.reduce((sum, course) => 
      sum + (course.transferable ? course.uhCredits : 0), 0);
    
    const transferReport = {
      studentName: extractedCourses[0]?.studentName,
      totalTransferableCredits: totalCredits,
      courses: evaluatedCourses,
      evaluation: {
        accepted: evaluatedCourses.filter(c => c.transferable).length,
        rejected: evaluatedCourses.filter(c => !c.transferable).length,
        total: evaluatedCourses.length
      }
    };
    
    res.json(transferReport);
  } catch (error) {
    res.status(500).json({ error: 'Transfer evaluation failed' });
  }
});
```

## Next Steps

1. **Test the equivalency matching** with real transcript data
2. **Add error handling** for courses not found in tables  
3. **Implement degree requirement mapping** (Core Curriculum, major requirements)
4. **Add course prerequisite checking**
5. **Create visual transfer credit reports** in the frontend

This structured approach will provide accurate, official UH transfer credit evaluations for both AP scores and community college transcripts. 