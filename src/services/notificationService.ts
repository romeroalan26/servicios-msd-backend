import sgMail from '@sendgrid/mail';
import { Empleado } from '../models/empleado';
import { Servicio } from '../models/servicio';

export interface NotificationData {
  empleado: Empleado;
  servicio: Servicio;
  fecha: string;
  tanda: string;
  turnoNombre?: string;
}

export class NotificationService {
  private static isInitialized = false;

  /**
   * Inicializa el servicio de notificaciones con la API key de SendGrid
   */
  static initialize(): void {
    if (this.isInitialized) return;

    const sendgridApiKey = process.env.SENDGRID_API_KEY;
    if (!sendgridApiKey) {
      console.warn(
        '⚠️  SENDGRID_API_KEY no configurada. Las notificaciones por correo estarán deshabilitadas.',
      );
      return;
    }

    sgMail.setApiKey(sendgridApiKey);
    this.isInitialized = true;
    console.log('✅ Servicio de notificaciones inicializado con SendGrid');
  }

  /**
   * Envía notificación de selección de servicio al empleado
   */
  static async sendSelectionNotification(
    data: NotificationData,
  ): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        console.warn('⚠️  Servicio de notificaciones no inicializado');
        return false;
      }

      const { empleado, servicio, fecha, tanda, turnoNombre } = data;

      const msg = {
        to: empleado.email,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@servicios-msd.com',
        subject: `✅ Servicio Seleccionado: ${servicio.nombre}`,
        html: this.generateEmployeeEmailHTML(data),
      };

      await sgMail.send(msg);
      console.log(
        `📧 Notificación enviada a ${empleado.email} para servicio ${servicio.nombre}`,
      );
      return true;
    } catch (error) {
      console.error('❌ Error enviando notificación al empleado:', error);
      return false;
    }
  }

  /**
   * Envía notificación al administrador sobre una nueva selección
   */
  static async sendAdminNotification(data: NotificationData): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        console.warn('⚠️  Servicio de notificaciones no inicializado');
        return false;
      }

      const adminEmails = this.getAdminEmails();
      if (adminEmails.length === 0) {
        console.warn('⚠️  No hay correos de administrador configurados');
        return false;
      }

      const { empleado, servicio, fecha, tanda, turnoNombre } = data;

      const msg = {
        to: adminEmails,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@servicios-msd.com',
        subject: `📋 Nueva Selección de Servicio - ${empleado.nombre}`,
        html: this.generateAdminEmailHTML(data),
      };

      await sgMail.send(msg);
      console.log(
        `📧 Notificación enviada a administradores sobre selección de ${empleado.nombre}`,
      );
      return true;
    } catch (error) {
      console.error('❌ Error enviando notificación al administrador:', error);
      return false;
    }
  }

  /**
   * Envía notificación a correos adicionales configurados
   */
  static async sendAdditionalNotifications(
    data: NotificationData,
  ): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        console.warn('⚠️  Servicio de notificaciones no inicializado');
        return false;
      }

      const additionalEmails = this.getAdditionalEmails();
      if (additionalEmails.length === 0) {
        return true; // No hay correos adicionales, no es un error
      }

      const { empleado, servicio, fecha, tanda, turnoNombre } = data;

      const msg = {
        to: additionalEmails,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@servicios-msd.com',
        subject: `📋 Selección de Servicio - ${empleado.nombre} - ${servicio.nombre}`,
        html: this.generateAdditionalEmailHTML(data),
      };

      await sgMail.send(msg);
      console.log(
        `📧 Notificación enviada a correos adicionales sobre selección de ${empleado.nombre}`,
      );
      return true;
    } catch (error) {
      console.error('❌ Error enviando notificaciones adicionales:', error);
      return false;
    }
  }

  /**
   * Envía todas las notificaciones relacionadas con una selección
   */
  static async sendAllNotifications(data: NotificationData): Promise<{
    empleado: boolean;
    admin: boolean;
    adicionales: boolean;
  }> {
    const results = {
      empleado: await this.sendSelectionNotification(data),
      admin: await this.sendAdminNotification(data),
      adicionales: await this.sendAdditionalNotifications(data),
    };

    console.log('📧 Resumen de notificaciones enviadas:', results);
    return results;
  }

  /**
   * Obtiene los correos de administrador desde variables de entorno
   */
  private static getAdminEmails(): string[] {
    const adminEmails = process.env.ADMIN_EMAILS;
    if (!adminEmails) return [];

    return adminEmails
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email);
  }

  /**
   * Obtiene los correos adicionales desde variables de entorno
   */
  private static getAdditionalEmails(): string[] {
    const additionalEmails = process.env.ADDITIONAL_EMAILS;
    if (!additionalEmails) return [];

    return additionalEmails
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email);
  }

  /**
   * Formatea una fecha para mostrar en español
   */
  private static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Capitaliza la primera letra de la tanda
   */
  private static capitalizeTanda(tanda: string): string {
    return tanda.charAt(0).toUpperCase() + tanda.slice(1);
  }

  /**
   * Genera el HTML para el correo del administrador
   */
  private static generateAdminEmailHTML(data: NotificationData): string {
    const { empleado, servicio, fecha, tanda, turnoNombre } = data;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nueva Selección de Servicio</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .details { background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
          .label { font-weight: bold; color: #555; }
          .value { margin-bottom: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📋 Nueva Selección de Servicio</h2>
            <p>Se ha registrado una nueva selección de servicio en el sistema.</p>
          </div>
          
          <div class="details">
            <div class="value">
              <span class="label">Empleado:</span> ${empleado.nombre}
            </div>
            <div class="value">
              <span class="label">Email:</span> ${empleado.email}
            </div>
            <div class="value">
              <span class="label">Prioridad:</span> ${empleado.prioridad}
            </div>
            <div class="value">
              <span class="label">Servicio:</span> ${servicio.nombre}
            </div>
            <div class="value">
              <span class="label">Descripción:</span> ${servicio.descripcion}
            </div>
            <div class="value">
              <span class="label">Fecha:</span> ${this.formatDate(fecha)}
            </div>
            <div class="value">
              <span class="label">Tanda:</span> ${this.capitalizeTanda(tanda)}
            </div>
            ${turnoNombre ? `<div class="value"><span class="label">Turno:</span> ${turnoNombre}</div>` : ''}
            <div class="value">
              <span class="label">Año:</span> ${new Date().getFullYear()}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Genera el HTML para los correos adicionales
   */
  private static generateAdditionalEmailHTML(data: NotificationData): string {
    const { empleado, servicio, fecha, tanda, turnoNombre } = data;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Selección de Servicio</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #e3f2fd; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .details { background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
          .label { font-weight: bold; color: #555; }
          .value { margin-bottom: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📋 Información de Selección de Servicio</h2>
            <p>Se ha registrado una selección de servicio en el sistema.</p>
          </div>
          
          <div class="details">
            <div class="value">
              <span class="label">Empleado:</span> ${empleado.nombre}
            </div>
            <div class="value">
              <span class="label">Servicio:</span> ${servicio.nombre}
            </div>
            <div class="value">
              <span class="label">Fecha:</span> ${this.formatDate(fecha)}
            </div>
            <div class="value">
              <span class="label">Tanda:</span> ${this.capitalizeTanda(tanda)}
            </div>
            ${turnoNombre ? `<div class="value"><span class="label">Turno:</span> ${turnoNombre}</div>` : ''}
            <div class="value">
              <span class="label">Año:</span> ${new Date().getFullYear()}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Genera el HTML para el correo del empleado
   */
  private static generateEmployeeEmailHTML(data: NotificationData): string {
    const { empleado, servicio, fecha, tanda, turnoNombre } = data;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Servicio Seleccionado</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #d4edda; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .details { background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
          .label { font-weight: bold; color: #555; }
          .value { margin-bottom: 15px; }
          .success { color: #155724; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>✅ Servicio Seleccionado Exitosamente</h2>
            <p class="success">¡Felicidades! Has seleccionado tu servicio para el año ${new Date().getFullYear()}.</p>
          </div>
          
          <div class="details">
            <div class="value">
              <span class="label">Empleado:</span> ${empleado.nombre}
            </div>
            <div class="value">
              <span class="label">Prioridad:</span> ${empleado.prioridad}
            </div>
            <div class="value">
              <span class="label">Servicio:</span> ${servicio.nombre}
            </div>
            <div class="value">
              <span class="label">Descripción:</span> ${servicio.descripcion}
            </div>
            <div class="value">
              <span class="label">Fecha:</span> ${this.formatDate(fecha)}
            </div>
            <div class="value">
              <span class="label">Tanda:</span> ${this.capitalizeTanda(tanda)}
            </div>
            ${turnoNombre ? `<div class="value"><span class="label">Turno:</span> ${turnoNombre}</div>` : ''}
            <div class="value">
              <span class="label">Año:</span> ${new Date().getFullYear()}
            </div>
          </div>
          
          <p style="margin-top: 20px; font-size: 14px; color: #666;">
            Esta selección ha sido registrada en el sistema. Si tienes alguna pregunta, contacta al administrador.
          </p>
        </div>
      </body>
      </html>
    `;
  }
}
