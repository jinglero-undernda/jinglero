<!-- 15cbbedd-7fb1-4d47-9dfc-a43d450a3a4d 15179ad3-1dd7-486d-9a66-32d47421ada1 -->
# Task 10: Date Picker and Data Type Safety (Revised)

## Audit Results

### Already Implemented ✅

1. **Timestamp Utilities**: `frontend/src/lib/utils/timestamp.ts` has all HH:MM:SS ↔ seconds conversion functions
2. **Artista Display Logic**: `entityDisplay.ts` already uses `stageName || name` as primary text (line 129)
3. **Artista Secondary Text**: Already shows name only if different from stageName (lines 181-182)
4. **Artista Sorting**: `entitySorters.ts` already sorts by `stageName || name` (lines 97-99)
5. **Validation Functions**: `entityValidation.ts` has format validators (YouTube ID, URL, email, social handles, year)

### Needs Implementation ❌

1. **react-datepicker** library not installed
2. **Date utilities** exist as local functions in EntityMetadataEditor (lines 31-92) - need to centralize
3. **DatePickerField** component doesn't exist
4. **Data sanitization** for NaN is weak (uses `parseFloat || 0` but not comprehensive)
5. **Pre-submission validation** to prevent NaN in API calls

## Implementation Tasks

### Phase 1: Install and Centralize Date Utilities

**1.1 Install react-datepicker**

```bash
cd frontend && npm install react-datepicker @types/react-datepicker
```

**1.2 Create `frontend/src/lib/utils/dateUtils.ts`**

Extract and centralize existing date functions from EntityMetadataEditor.tsx (lines 31-92):

- `formatDateDDMMYYYY()` → `formatDateDisplay()`
- `parseDate()` → `parseISODate()`
- `splitDate()` → remove (not needed with date picker)
- `combineDate()` → remove (not needed with date picker)
- Add: `dateToISO(date: Date | null): string`
- Add: `isValidISODate(dateString: string): boolean`

**1.3 Create `frontend/src/lib/utils/dataTypeSafety.ts`**

New module for NaN prevention:

```typescript
export function sanitizeNumericField(value: any, defaultValue?: number | null): number | null {
  if (value === null || value === undefined || value === '') return defaultValue ?? null;
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  return isNaN(num) ? (defaultValue ?? null) : num;
}

export function sanitizeStringField(value: any, defaultValue: string = ''): string {
  if (value === null || value === undefined) return defaultValue;
  return String(value);
}

export function sanitizeBooleanField(value: any, defaultValue: boolean = false): boolean {
  if (value === null || value === undefined) return defaultValue;
  return Boolean(value);
}
```

Note: Use existing `normalizeTimestampToSeconds()` from `timestamp.ts` for timestamp fields.

### Phase 2: Create DatePickerField Component

**2.1 Create `frontend/src/components/common/DatePickerField.tsx`**

Props:

- `value: string | null` (ISO date string from formData)
- `onChange: (isoString: string) => void`
- `onBlur: () => void`
- `hasError: boolean`
- `minDate?: Date`
- `maxDate?: Date`

Features:

- Import `react-datepicker` and styles
- Use `dateUtils` to convert ISO ↔ Date
- Display format: dd/mm/yyyy
- Date range: 2000-01-01 to (current year + 1)
- Error styling: red border (#d32f2f)
- Dark mode styling matching existing admin UI

**2.2 Create `frontend/src/styles/components/date-picker.css`**

Dark mode theme:

- Background: #2a2a2a
- Border: #444
- Text: #fff
- Selected: #1976d2
- Hover: #3a3a3a

### Phase 3: Replace Fabrica Date Inputs

**3.1 Update `frontend/src/components/admin/EntityMetadataEditor.tsx`**

Remove:

- Lines 31-92: Local date functions (move to dateUtils)
- Line 110: `dateComponents` state
- Lines 307-315: `handleDateComponentChange` function
- Lines 687-765: Day/month/year inputs

Add:

- Import: `import DatePickerField from '../common/DatePickerField'`
- Import: `import { formatDateDisplay, parseISODate, dateToISO, isValidISODate } from '../../lib/utils/dateUtils'`

Replace date field rendering (lines 687-765):

```tsx
{fieldName === 'date' && entityType === 'fabrica' ? (
  <>
    <label style={{...}}>date:</label>
    <div style={{...}}>
      <DatePickerField
        value={formData.date || null}
        onChange={(isoDate) => handleFieldChange('date', isoDate)}
        onBlur={() => handleFieldBlur('date')}
        hasError={!!fieldErrors.date}
      />
      {fieldErrors.date && <FieldErrorDisplay error={fieldErrors.date} fieldName="date" />}
    </div>
  </>
) : ...
```

Update view mode (lines 1057-1080):

```tsx
{fieldName === 'date' && entityType === 'fabrica' ? (
  <>
    <span style={{...}}>date:</span>
    <span style={{...}}>
      {value ? formatDateDisplay(value) : '(vacío)'}
    </span>
  </>
) : ...
```

**3.2 Remove date splitting logic from formData initialization**

In `useEffect` (lines 119-182):

- Remove lines 145-148: dateComponents initialization
- Date is stored as ISO string directly in formData

### Phase 4: Add Data Sanitization

**4.1 Update `EntityMetadataEditor.handleSave`**

Before line 343 (`const updatePayload: Partial<Entity> = { ...formData }`):

```typescript
// Sanitize numeric fields to prevent NaN
const sanitizedData = { ...formData };

if (entityType === 'fabrica') {
  sanitizedData.visualizations = sanitizeNumericField(formData.visualizations, null);
  sanitizedData.likes = sanitizeNumericField(formData.likes, null);
  
  // Validate date
  if (formData.date && !isValidISODate(formData.date)) {
    setFieldErrors({ ...fieldErrors, date: 'Fecha inválida' });
    showToast('La fecha no es válida', 'error');
    return;
  }
}

if (entityType === 'cancion') {
  sanitizedData.year = sanitizeNumericField(formData.year, null);
}

if (entityType === 'jingle' && formData.timestamp) {
  // Validate timestamp using existing utility
  const normalized = normalizeTimestampToSeconds(formData.timestamp);
  if (normalized === null) {
    setFieldErrors({ ...fieldErrors, timestamp: 'Formato inválido (HH:MM:SS)' });
    showToast('Formato de timestamp inválido', 'error');
    return;
  }
}

const updatePayload: Partial<Entity> = sanitizedData;
```

**4.2 Update `EntityForm.tsx` handleSubmit**

Similar sanitization before line 67 (`if (id) payload.id = id`):

```typescript
// Sanitize numeric fields by entity type
if (type === 'fabrica') {
  if (payload.visualizations !== null) payload.visualizations = sanitizeNumericField(payload.visualizations, null);
  if (payload.likes !== null) payload.likes = sanitizeNumericField(payload.likes, null);
}
if (type === 'cancion' && payload.year !== null) {
  payload.year = sanitizeNumericField(payload.year, null);
}
```

**4.3 Add NaN detection in API client**

In `frontend/src/lib/api/client.ts`, update `put` and `patch` methods (around lines 630 and 634):

```typescript
async put<T>(url: string, data?: any): Promise<T> {
  // Detect NaN values before sending
  if (data && typeof data === 'object') {
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'number' && isNaN(value)) {
        console.error(`NaN detected in field: ${key}`, data);
        throw new Error(`Invalid data: field "${key}" has NaN value`);
      }
    }
  }
  return this.request<T>(url, { method: 'PUT', data });
}
```

### Phase 5: Fix Field Configuration

**5.1 Update FIELD_ORDER in `fieldConfigs.ts`**

Add missing fields per R2 spec (section 5 - Entity Specifications):

```typescript
FIELD_ORDER: {
  jingle: [
    'id', 'title', 'isJinglazo', 'isJinglazoDelDia', 'isPrecario', 
    'isLive', 'isRepeat', 'comment', 'youtubeClipUrl', 'lyrics'
  ],
  fabrica: [
    'id', 'title', 'date', 'status', 'youtubeUrl', 'contents'
  ],
  cancion: [
    'id', 'title', 'album', 'year', 'genre', 'youtubeMusic', 'lyrics'
  ],
  artista: [
    'id', 'name', 'stageName', 'nationality', 'youtubeHandle', 
    'instagramHandle', 'twitterHandle', 'facebookProfile', 'website', 'bio'
  ],
  tematica: [
    'id', 'name', 'description', 'category'
  ],
}
```

**Key changes per R2 spec**:

- **Fabrica**: Add `contents` (line 374 of R2 spec - always visible)
  - **Do NOT add** `description` (line 356 - removed for future YouTube sync)
  - **Do NOT add** `visualizations`, `likes` (lines 354-355 - auto-managed, not editable)
- **Jingle**: Add `youtubeClipUrl` (line 442), `lyrics` (line 443) - both always shown
- **Cancion**: Add `lyrics` (line 493 - textarea)
- **Artista**: Remove `isArg` from display (line 544 - hidden, auto-managed)
- **Tematica**: Keep current order (description before category per line 591)

**5.2 Verify Field Types Are Handled Correctly**

Confirm EntityMetadataEditor handles field types properly:

- Booleans → checkboxes (already working, lines 937-964)
- Enums → dropdowns (already working for status, category, nationality)
- Textareas → multi-line inputs (already configured in TEXTAREA_FIELDS)
- Numbers → numeric inputs (already using `type="number"` for year)

### Phase 6: Testing

**6.1 Manual Testing Checklist**

Date Picker:

- [ ] Create Fabrica with date picker - verify ISO in network tab
- [ ] Edit Fabrica date - verify dd/mm/yyyy display
- [ ] Save edited date - verify persistence
- [ ] Test empty date handling
- [ ] Test date validation (out of range)

Data Sanitization:

- [ ] Edit Fabrica.visualizations to empty - verify null/0 sent
- [ ] Edit Fabrica.likes to empty - verify null/0 sent
- [ ] Edit Cancion.year to empty - verify null sent
- [ ] Edit Jingle.timestamp to invalid format - verify error shown
- [ ] Check network tab - no NaN values in any API calls

Artista Display (verify no regressions):

- [ ] View Artista with stageName - primary text is stageName
- [ ] View Artista with only name - primary text is name
- [ ] View Artista with both - stageName primary, name secondary
- [ ] Sort Artistas - sorted by stageName (or name if no stageName)

**5.2 Documentation**

Add comments explaining:

- Data flow in EntityMetadataEditor (formData → sanitization → API → Neo4j)
- Date format conversions (ISO ↔ Date ↔ dd/mm/yyyy)
- Why sanitization is needed (prevent NaN from empty inputs)

## Files to Create

- `frontend/src/lib/utils/dateUtils.ts` (extracted from EntityMetadataEditor)
- `frontend/src/lib/utils/dataTypeSafety.ts` (new)
- `frontend/src/components/common/DatePickerField.tsx` (new)
- `frontend/src/styles/components/date-picker.css` (new)

## Files to Modify

- `frontend/src/components/admin/EntityMetadataEditor.tsx` (remove local date functions, use DatePickerField)
- `frontend/src/components/admin/EntityForm.tsx` (add sanitization)
- `frontend/src/lib/api/client.ts` (add NaN detection)

## Files NOT Needing Changes (Already Correct)

- `frontend/src/lib/utils/entityDisplay.ts` (Artista logic correct)
- `frontend/src/lib/utils/entitySorters.ts` (Artista sorting correct)
- `frontend/src/lib/utils/timestamp.ts` (timestamp utilities exist)
- `frontend/src/lib/validation/entityValidation.ts` (validators exist)

## Success Criteria

- Date picker works for Fabrica with dd/mm/yyyy display
- ISO dates stored correctly in database
- No NaN values in API calls (verified in network tab)
- Empty numeric fields send null (not NaN)
- Invalid timestamps blocked with clear error message
- All existing Artista display/sorting continues to work