const fs = require("fs")
const path = require("path")
const PDFDocument = require("pdfkit")

const generateStatementFile = async (accountNumber, transactions, balance) => {

    const dirPath = path.join(__dirname, "../files")

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
    }

    const filePath = path.join(dirPath, `statement-${accountNumber}--${Date.now()}.pdf`)

    const doc = new PDFDocument({ margin: 40 })
    const stream = fs.createWriteStream(filePath)

    doc.pipe(stream)

    // Header
    doc.fontSize(18).text("RONAK KI BANK", { align: "center" })
    doc.moveDown()
    doc.fontSize(12)
    doc.text(`Account Number: ${accountNumber}`)
    doc.text(`Date: ${new Date().toLocaleString()}`)
    doc.moveDown(2)

    // Table Column Positions
    const startX = 40
    const col = {
        no: startX,
        type: startX + 40,
        amount: startX + 120,
        from: startX + 200,
        to: startX + 300,
        date: startX + 400
    }

    let y = doc.y

    // Header Row
    doc.font("Helvetica-Bold")
    doc.text("No", col.no, y)
    doc.text("Type", col.type, y)
    doc.text("Amount", col.amount, y)
    doc.text("From", col.from, y)
    doc.text("To", col.to, y)
    doc.text("Date", col.date, y)

    y += 20
    doc.moveTo(startX, y - 5).lineTo(550, y - 5).stroke()

    doc.font("Helvetica")

    // Rows
    transactions.forEach((txn, index) => {

        let fromAcc = txn.fromAccount?.accountNumber
        let toAcc = txn.toAccount?.accountNumber

        if (txn.type === "deposit") {
            fromAcc = "BANK"
            toAcc = toAcc || accountNumber
        } else if (txn.type === "withdraw") {
            fromAcc = fromAcc || accountNumber
            toAcc = "BANK"
        } else if (txn.type === "transfer") {
            if (fromAcc == accountNumber) fromAcc = "SELF"
            if (toAcc == accountNumber) toAcc = "SELF"
        }

        doc.text(index + 1, col.no, y, { width: 30 })
        doc.text(txn.type.toUpperCase(), col.type, y, { width: 70 })
        doc.text(`Rs.${txn.amount}`, col.amount, y, { width: 70 })
        doc.text(fromAcc || "-", col.from, y, { width: 80 })
        doc.text(toAcc || "-", col.to, y, { width: 80 })
        doc.text(new Date(txn.createdAt).toLocaleDateString(), col.date, y, { width: 80 })
        y += 20

        // Auto next page
        if (y > 750) {
            doc.addPage()
            y = 50
        }
    })

    // Balance
    y += 20
    doc.font("Helvetica-Bold")
    doc.text(`Available Balance: Rs.${balance}`, startX, y, {
        align: "right"
    })

    doc.end()

    await new Promise((resolve) => stream.on("finish", resolve))

    return filePath
}

module.exports = generateStatementFile