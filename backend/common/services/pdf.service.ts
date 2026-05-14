import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import { PrescriptionResponseDto } from '../../prescriptions/prescriptions.dto';

@Injectable()
export class PdfService {
  /**
   * Generate PDF for a prescription
   */
  async generatePrescriptionPdf(prescription: PrescriptionResponseDto): Promise<Buffer> {
    const qrDataUrl = await QRCode.toDataURL(`http://localhost:3000/patient/prescriptions/${prescription.id}`);
    const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

    return new Promise((resolve) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Header
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('NUTRABITICS', { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(16)
        .text('Receta Médica', { align: 'center' })
        .moveDown(1);

      // Prescription details
      doc
        .fontSize(12)
        .font('Helvetica')
        .text(`Código: ${prescription.code}`)
        .text(`ID de Receta: ${prescription.id}`)
        .text(`Fecha: ${prescription.createdAt.toLocaleDateString('es-ES')}`)
        .text(`Estado: ${prescription.status === 'PENDING' ? 'Pendiente' : 'Consumida'}`)
        .moveDown(1);

      if (prescription.consumedAt) {
        doc.text(`Consumida el: ${prescription.consumedAt.toLocaleDateString('es-ES')}`)
          .moveDown(1);
      }

      if (prescription.notes) {
        doc
          .font('Helvetica-Bold')
          .text('Notas:')
          .font('Helvetica')
          .text(prescription.notes)
          .moveDown(1);
      }

      // Doctor info
      if (prescription.doctor) {
        doc
          .font('Helvetica-Bold')
          .text('Médico:')
          .font('Helvetica')
          .text(`${prescription.doctor.user.firstName} ${prescription.doctor.user.lastName}`)
          .text(`Email: ${prescription.doctor.user.email}`)
          .moveDown(1);
      }

      // Patient info
      if (prescription.patient) {
        doc
          .font('Helvetica-Bold')
          .text('Paciente:')
          .font('Helvetica')
          .text(`${prescription.patient.user.firstName} ${prescription.patient.user.lastName}`)
          .text(`Email: ${prescription.patient.user.email}`)
          .moveDown(1);
      } else if (prescription.patientEmail) {
        doc
          .font('Helvetica-Bold')
          .text('Paciente externo:')
          .font('Helvetica')
          .text(`Email: ${prescription.patientEmail}`)
          .moveDown(1);
      }

      // Items
      doc
        .font('Helvetica-Bold')
        .fontSize(14)
        .text('Medicamentos Prescritos:')
        .moveDown(0.5);

      prescription.items.forEach((item, index) => {
        doc
          .font('Helvetica-Bold')
          .fontSize(12)
          .text(`${index + 1}. ${item.name}`)
          .font('Helvetica')
          .text(`   Dosis: ${item.dosage}`)
          .text(`   Cantidad: ${item.quantity}`)
          .text(`   Instrucciones: ${item.instructions || 'No especificadas'}`)
          .moveDown(0.5);
      });

      // Footer
      doc
        .moveDown(2)
        .fontSize(10)
        .font('Helvetica')
        .text('Esta receta fue generada electrónicamente por NUTRABITICS.', { align: 'center' })
        .text('Conserve este documento para sus registros médicos.', { align: 'center' })
        .moveDown(1);

      // Add QR Code
      const qrSize = 100;
      const pageWidth = doc.page.width;
      const qrX = (pageWidth - qrSize) / 2; // Center the QR code
      doc.text('Escanee el código QR para ver la receta en línea:', { align: 'center' })
        .moveDown(0.5);
      doc.image(qrBuffer, qrX, doc.y, { width: qrSize, height: qrSize });

      doc.end();
    });
  }

  /**
   * Generate QR code for a prescription
   */
  async generatePrescriptionQr(prescriptionId: string): Promise<string> {
    const qrDataUrl = await QRCode.toDataURL(`http://localhost:3000/patient/prescriptions/${prescriptionId}`);
    return qrDataUrl;
  }
}