from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "assets" / "docs" / "jack-j6-m9.pdf"
FONT_REGULAR = Path("C:/Windows/Fonts/arial.ttf")
FONT_BOLD = Path("C:/Windows/Fonts/arialbd.ttf")

pdfmetrics.registerFont(TTFont("Arial", str(FONT_REGULAR)))
pdfmetrics.registerFont(TTFont("Arial-Bold", str(FONT_BOLD)))

RED = colors.HexColor("#c80712")
INK = colors.HexColor("#111820")
MUTED = colors.HexColor("#5d6670")
LINE = colors.HexColor("#dfe3e7")
SOFT = colors.HexColor("#f5f6f7")

styles = getSampleStyleSheet()
title_style = ParagraphStyle(
    "Title",
    parent=styles["Title"],
    fontName="Arial-Bold",
    fontSize=22,
    leading=25,
    textColor=INK,
    alignment=TA_LEFT,
    spaceAfter=5 * mm,
)
subtitle_style = ParagraphStyle(
    "Subtitle",
    parent=styles["Normal"],
    fontName="Arial",
    fontSize=9,
    leading=13,
    textColor=MUTED,
    spaceAfter=5 * mm,
)
cell_style = ParagraphStyle(
    "Cell",
    parent=styles["Normal"],
    fontName="Arial",
    fontSize=7.7,
    leading=10,
    textColor=INK,
)
cell_bold_style = ParagraphStyle(
    "CellBold",
    parent=cell_style,
    fontName="Arial-Bold",
)
note_style = ParagraphStyle(
    "Note",
    parent=styles["Normal"],
    fontName="Arial",
    fontSize=7.5,
    leading=10,
    textColor=MUTED,
    spaceBefore=4 * mm,
)


J6 = [
    ("Назначение", "Полный цикл изготовления прорезного кармана"),
    ("Виды карманов", "Прямые и наклонные, с одной или двумя обтачками, с клапаном или без, с молнией"),
    ("Длина кармана", "До 210 мм"),
    ("Ширина обтачки", "10-40 мм"),
    ("Мощность лазера", "120 Вт"),
    ("Макс. скорость шитья", "До 3 000 ст/мин"),
    ("Привод", "Многоосевой ЧПУ, сервопривод / прямой привод"),
    ("Игла", "MTx190 N 9-18"),
    ("Подъем прижимной лапки", "До 80 мм"),
    ("Память", "До 999 программ"),
    ("Длина стежка", "3,5 мм"),
    ("Автоматические функции", "Обрезка нити, закрепка, позиционирование иглы, программируемая панель"),
    ("Питание и воздух", "220 В; сжатый воздух около 0,7 МПа"),
    ("Цикл", "Около 20 секунд на карман"),
    ("Комплектация", "Голова, стол, стойка, ЧПУ, сенсорная панель, лазер"),
    ("Применение", "Костюмы, корпоративная одежда, пальто; легкие, средние и тяжелые материалы"),
]

M9 = [
    ("Конфигурация", "M9-SS-F13-X"),
    ("Поле шитья", "1400 x 950 мм"),
    ("Макс. скорость шитья", "До 3 600 ст/мин"),
    ("Привод", "Шаговые двигатели"),
    ("Швейная система", "1 игла / 2 нити, поворотный челнок"),
    ("Материалы", "Легкие, средние и тяжелые"),
    ("Память шаблона", "До 60 000 стежков"),
    ("Питание", "Зависит от комплектации"),
    ("Сжатый воздух", "0,6 МПа, 3 л/мин"),
    ("Вес", "610 / 690 кг (нетто / брутто)"),
    ("Габариты", "2200 x 1220 x 1650 мм"),
    ("Применение", "Контурное шитье крупных деталей и шаблонных операций"),
]


def header_footer(canvas, document):
    canvas.saveState()
    width, _ = landscape(A4)
    canvas.setStrokeColor(RED)
    canvas.setLineWidth(1.2)
    canvas.line(16 * mm, 12 * mm, width - 16 * mm, 12 * mm)
    canvas.setFont("Arial", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(16 * mm, 7 * mm, "ООО «Текстиль Опт Торг» | tekstilopttorg@mail.ru | +7 (927) 667-73-07")
    canvas.drawRightString(width - 16 * mm, 7 * mm, f"Страница {document.page}")
    canvas.restoreState()


def model_page(name, description, rows):
    story = [
        Paragraph(f"Технические <font color='#c80712'>характеристики {name}</font>", title_style),
        Paragraph(description, subtitle_style),
    ]
    data = [[Paragraph("Параметр", cell_bold_style), Paragraph(name, cell_bold_style)]]
    data.extend([[Paragraph(label, cell_bold_style), Paragraph(value, cell_style)] for label, value in rows])
    table = Table(data, colWidths=[66 * mm, 186 * mm], repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), RED),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.5, LINE),
        ("BACKGROUND", (0, 1), (0, -1), SOFT),
        ("LEFTPADDING", (0, 0), (-1, -1), 3.2 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3.2 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 1.65 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1.65 * mm),
    ]))
    story.extend([
        table,
        Paragraph("Характеристики приведены по материалам заказчика. Параметры могут отличаться в зависимости от конфигурации и комплектации.", note_style),
    ])
    return story


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    document = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=landscape(A4),
        rightMargin=16 * mm,
        leftMargin=16 * mm,
        topMargin=14 * mm,
        bottomMargin=18 * mm,
        title="Технические характеристики JACK J6 и JACK M9",
        author="ООО «Текстиль Опт Торг»",
    )
    story = model_page("JACK J6", "Автомат для полного цикла изготовления прорезных карманов.", J6)
    story.extend([PageBreak(), *model_page("JACK M9", "Конфигурация M9-SS-F13-X для контурного шитья крупных деталей.", M9)])
    document.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(OUTPUT)


if __name__ == "__main__":
    main()
