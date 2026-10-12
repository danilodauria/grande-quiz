# -*- coding: utf-8 -*-
import io, os
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from finalize import drop_stray_blank_pages

def main():
    reader = PdfReader("out_answersheet.pdf")
    pages, dropped = drop_stray_blank_pages(reader)
    if dropped:
        print("Pagine quasi vuote rimosse:", dropped)

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    w, h = A4
    for i in range(len(pages)):
        if i >= 1:
            c.setFont("Helvetica", 9)
            c.setFillColorRGB(0.54, 0.48, 0.40)
            c.drawCentredString(w/2, 12*2.834645, str(i+1))
        c.showPage()
    c.save(); buf.seek(0)
    numbers = PdfReader(buf)

    writer = PdfWriter()
    for i, p in enumerate(pages):
        p.merge_page(numbers.pages[i])
        writer.add_page(p)
    writer.add_metadata({"/Title": "FeniceOS — Foglio delle Risposte", "/Author": "Danilo D'Auria"})

    BASE = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(os.path.join(BASE, "output"), exist_ok=True)
    out_path = os.path.join(BASE, "output", "FeniceOS_Foglio_Risposte.pdf")
    with open(out_path, "wb") as f:
        writer.write(f)
    print("Scritto:", out_path, "- pagine totali:", len(writer.pages))

if __name__ == "__main__":
    main()
