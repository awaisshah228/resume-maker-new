# GrapesJS Resume Editor Guide

## 🚀 Overview

This resume maker now includes a powerful **GrapesJS-based drag-and-drop editor** that allows users to:
- ✨ Drag and drop pre-built resume components
- 🎨 Choose from 3 beautiful predefined templates
- ✏️ Edit content inline by clicking any element
- 📄 Export as high-quality PDF
- 💾 Save and load resume data

## 📁 Project Structure

```
src/
├── app/
│   ├── grapes-editor/
│   │   └── page.tsx          # GrapesJS editor page
│   └── editor/
│       └── page.tsx           # Classic editor (original)
├── components/
│   └── editor/
│       └── GrapesJSEditor.tsx # Main GrapesJS component
```

## 🎯 Features

### 1. **Predefined Resume Templates**
Located in the "Templates" category in the blocks panel:

- **Professional** - Classic layout with gradient header
- **Modern** - Two-column layout with dark sidebar
- **Creative** - Bold and colorful design

### 2. **Resume Building Blocks**
Located in the "Resume Sections" category:

- **Header** - Full-width gradient header with name and contact info
- **Minimal Header** - Clean header with simple styling
- **Summary** - Professional summary section
- **Experience** - Work experience with bullet points
- **Education** - Education details
- **Skills** - Skill badges (pill design)
- **Skills (Columns)** - Skills organized in columns
- **Projects** - Project showcase section

### 3. **Drag & Drop Interface**
- Simply drag any block from the left panel
- Drop it into the canvas
- Click to edit any text or styling

### 4. **Export to PDF**
Two ways to export:
1. Click the **Export PDF** button in the top-right
2. Use the download icon in the GrapesJS toolbar

The PDF will be A4 size with perfect formatting.

### 5. **Save & Load**
- Click **Save** to store resume data in localStorage
- Data persists across sessions
- Can be extended to save to a database

## 🎨 Customization

### Editing Content
1. Click on any element in the canvas
2. Edit text directly
3. Use the Style Manager (right panel) to adjust:
   - Colors
   - Fonts
   - Spacing
   - Backgrounds
   - Borders

### Adding Components
1. Open the blocks panel (left side)
2. Browse "Templates" or "Resume Sections"
3. Drag desired block onto canvas
4. Customize to your needs

### Styling
- Select any element
- Use the Style Manager panel
- Adjust typography, colors, spacing, etc.
- Changes apply in real-time

## 🛠️ Technical Details

### Dependencies
```json
{
  "grapesjs": "^0.21.x",
  "grapesjs-preset-webpage": "^1.0.x",
  "grapesjs-blocks-basic": "^1.0.x",
  "grapesjs-plugin-export": "^1.0.x",
  "html2pdf.js": "^0.10.x"
}
```

### Canvas Settings
- Default device: Desktop (1024px)
- A4 device: 794px (A4 width at 96 DPI)
- Responsive breakpoints supported

### Fonts Included
- Inter
- Roboto
- Open Sans

## 🌐 Routes

- `/grapes-editor` - Main GrapesJS editor (recommended)
- `/editor` - Classic editor (original implementation)
- `/` - Landing page with links to both editors

## 💡 Usage Tips

1. **Start with a Template**
   - Click on a template block to load a complete resume structure
   - Customize from there

2. **Build from Scratch**
   - Add individual sections one by one
   - Arrange them in your preferred order

3. **Responsive Design**
   - Use the device switcher to preview different sizes
   - A4 device shows how it will look in PDF

4. **Keyboard Shortcuts**
   - Ctrl/Cmd + Z: Undo
   - Ctrl/Cmd + Shift + Z: Redo
   - Delete: Remove selected element

## 🎓 Best Practices

1. **Use Templates as Starting Points**
   - Templates provide professional layouts
   - Easier than building from scratch

2. **Keep It Simple**
   - Avoid overly complex designs
   - Focus on readability

3. **Test Before Exporting**
   - Preview in A4 device mode
   - Check all content is visible
   - Ensure good contrast

4. **Save Regularly**
   - Click Save after major changes
   - Data persists in localStorage

## 🔧 Extending the Editor

### Adding New Blocks
Edit `src/components/editor/GrapesJSEditor.tsx`:

```typescript
editorInstance.BlockManager.add('your-block-id', {
  label: 'Your Block Name',
  category: 'Resume Sections',
  content: `
    <div style="...">
      Your HTML content here
    </div>
  `,
});
```

### Customizing Export
Modify the `export-pdf` command in `GrapesJSEditor.tsx`:

```typescript
const opt = {
  margin: 0,
  filename: 'resume.pdf',
  image: { type: 'jpeg' as const, quality: 0.98 },
  html2canvas: { scale: 2, useCORS: true },
  jsPDF: { 
    unit: 'mm', 
    format: 'a4', 
    orientation: 'portrait' as const 
  }
};
```

### Backend Integration
To save resumes to a database:

```typescript
const handleSave = async (html: string, css: string) => {
  await fetch('/api/resumes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ html, css })
  });
};
```

## 🐛 Troubleshooting

### Editor Not Loading
- Check browser console for errors
- Ensure all dependencies are installed
- Try clearing browser cache

### PDF Export Issues
- Ensure all images have CORS headers
- Use web-safe fonts or include font files
- Check console for html2pdf errors

### Styling Not Applied
- Check if inline styles are used
- Verify CSS is properly scoped
- Use Style Manager for adjustments

## 📝 License

This project uses:
- GrapesJS (BSD-3-Clause)
- html2pdf.js (MIT)
- Next.js (MIT)

---

**Happy Resume Building! 🎉**

