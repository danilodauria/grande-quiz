# -*- coding: utf-8 -*-
import io, os
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4

def make_numbers_pdf(n_pages, skip_first=3):
    """Crea un PDF con solo i numeri di pagina, da sovrapporre al corpo del libro.
    Le prime `skip_first` pagine (frontespizio, prefazione, indice) restano senza numero."""
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    w, h = A4
    for i in range(n_pages):
        if i >= skip_first:
            c.setFont("Helvetica", 9)
            c.setFillColorRGB(0.54, 0.48, 0.40)
            c.drawCentredString(w/2, 12*2.834645, str(i+1))
        c.showPage()
    c.save()
    buf.seek(0)
    return PdfReader(buf)

def drop_stray_blank_pages(reader, min_chars=15):
    """Rete di sicurezza anti-refuso di impaginazione: rimuove pagine di corpo
    che risultano quasi del tutto vuote (bug di overflow del motore di stampa),
    senza toccare le pagine volutamente 'leggere' (frontespizio, divisori di parte),
    che contengono comunque titolo/sottotitolo ben oltre la soglia."""
    kept = []
    dropped = []
    for i, p in enumerate(reader.pages):
        txt = (p.extract_text() or "").strip()
        if len(txt) < min_chars:
            dropped.append(i+1)
            continue
        kept.append(p)
    return kept, dropped

def main():
    cover = PdfReader("out_cover.pdf")
    book = PdfReader("out_book.pdf")
    back = PdfReader("out_backcover.pdf")

    book_pages, dropped = drop_stray_blank_pages(book)
    if dropped:
        print("Pagine quasi vuote rimosse dal corpo (indice 1-based nel file intermedio):", dropped)

    numbers = make_numbers_pdf(len(book_pages), skip_first=3)

    writer = PdfWriter()
    for p in cover.pages:
        writer.add_page(p)
    for i, p in enumerate(book_pages):
        p.merge_page(numbers.pages[i])
        writer.add_page(p)
    for p in back.pages:
        writer.add_page(p)

    writer.add_metadata({
        "/Title": "FeniceOS — Tecnologia Gentile per Tutte le Età",
        "/Author": "Danilo D'Auria",
        "/Subject": "Manuale didattico, fondamenti e quiz sul progetto FeniceOS",
    })

    BASE = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(os.path.join(BASE, "output"), exist_ok=True)
    out_path = os.path.join(BASE, "output", "FeniceOS_Manuale_Tecnologia_Gentile.pdf")
    with open(out_path, "wb") as f:
        writer.write(f)
    print("Scritto:", out_path, "- pagine totali:", len(writer.pages))

if __name__ == "__main__":
    main()
