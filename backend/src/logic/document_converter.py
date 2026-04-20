from charset_normalizer import from_path
import pypandoc
import tempfile
import os
from fastapi import HTTPException

class DocumentConverter:
    PDF_ENGINES = {
        "science": "xelatex",
        "simple": "weasyprint"
    }

    BROWSER_SUPPORTED_FORMATS = {".pdf", ".jpg", ".jpeg", ".png", ".gif"}
    CODE_FORMATS = {".py", ".js", ".ts", ".cpp", ".h", ".cs", ".sql", ".json", ".yaml", ".yml", ".tsx"}

    @staticmethod
    def convert(source: str, to_format: str, is_file: bool = True) -> str:
        suffix = f".{to_format}"
        temp_out = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        ext = os.path.splitext(source)[1].lower() if is_file else ".md"
        from_format = "markdown+tex_math_dollars+tex_math_single_backslash+smart+raw_tex" if ext in [".md", ".markdown"] else None
        args = [
            "--metadata", f"title={os.path.basename(source) if is_file else 'Ответ_рецензенту'}"
        ]
        
        if to_format == "pdf":
            ext = os.path.splitext(source)[1].lower() if is_file else ".md"
            if ext in [".tex", ".md"]:
                engine = DocumentConverter.PDF_ENGINES["science"]
                args.extend([
                    f"--pdf-engine={engine}",
                    "-V", "mainfont=Noto Sans",
                    "-M", "amsmath=true",
                    "-V", "header-includes=\\usepackage[english,russian]{babel}",
                    "-V", "header-includes=\\usepackage[italic]{mathastext}",
                ])
            else:
                engine = DocumentConverter.PDF_ENGINES["simple"]
                args.append(f"--pdf-engine={engine}")

        try:
            pypandoc.convert_file(
                source, 
                to_format,
                format=from_format,
                outputfile=temp_out.name, 
                extra_args=args
            )
            return temp_out.name
            
        except Exception as e:
            if os.path.exists(temp_out.name):
                os.remove(temp_out.name)
            raise HTTPException(status_code=500, detail=f"Конвертация не удалась: {str(e)}")
        
    @staticmethod
    def ensure_utf8_encoding(file_path: str) -> str:
        results = from_path(file_path)
        best_match = results.best()
        
        if not best_match:
            with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
                return f.read()
        
        return str(best_match)