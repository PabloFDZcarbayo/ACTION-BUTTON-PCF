/**
 * Action Button PCF Control for Dynamics 365
 * 
 * Botón personalizable basado en FluentUI que puede ejecutar funciones JavaScript
 * o Custom APIs de Dynamics 365
 * 
 * @author Pablo Fernández Carbayo
 * @see https://www.linkedin.com/in/pablo-fernandez-carbayo-505b11141/
 */

import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { PrimaryButton, DefaultButton } from "@fluentui/react/lib/Button";
import { initializeIcons } from "@fluentui/react/lib/Icons";

// Inicializar iconos de FluentUI
initializeIcons();

interface IActionButtonProps {
  label: string;
  isPrimary: boolean;
  shape: number;
  size: number;
  disabled: boolean;
  onClick: () => void;
}

/**
 * Componente React del botón
 */
const ActionButtonComponent: React.FC<IActionButtonProps> = (props) => {
  const { label, isPrimary, shape, size, disabled, onClick } = props;

  // Estilos según shape: 0=Rounded, 1=Circular, 2=Square
  const borderRadius = shape === 1 ? 9999 : shape === 2 ? 0 : 4;

  // Estilos según size: 0=Small, 1=Medium, 2=Large
  const sizeStyles: Record<number, object> = {
    0: { height: 24, fontSize: 12, paddingLeft: 8,  paddingRight: 8,  minWidth: 60 },
    1: { height: 32, fontSize: 14, paddingLeft: 16, paddingRight: 16, minWidth: 80 },
    2: { height: 40, fontSize: 16, paddingLeft: 20, paddingRight: 20, minWidth: 100 },
  };

  const buttonStyles = {
    root: {
      marginTop: 10,
      marginBottom: 10,
      borderRadius,
      ...sizeStyles[size] ?? sizeStyles[1],
    },
    label: {
      fontSize: (sizeStyles[size] as any)?.fontSize,
    },
  };

  const buttonProps = {
    text: label,
    disabled: disabled,
    onClick: onClick,
    styles: buttonStyles,
    ariaLabel: label,
  };

  if (isPrimary) {
    return React.createElement(PrimaryButton, buttonProps);
  } else {
    return React.createElement(DefaultButton, buttonProps);
  }
};

export class ActionButton implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private _container: HTMLDivElement;
  private _context: ComponentFramework.Context<IInputs>;
  private _notifyOutputChanged: () => void;
  
  // Propiedades del control
  private _buttonLabel: string;
  private _buttonType: number;
  private _shape: number;
  private _buttonSize: number;
  private _contextValue: string | null;
  private _jsFunctionName: string | null;
  private _customApiLogicalName: string | null;
  private _fieldsToSend: string | null;
  private _disabled: boolean;

  /**
   * Inicialización del control
   */
  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    this._context = context;
    this._container = container;
    this._notifyOutputChanged = notifyOutputChanged;

    // Cargar propiedades iniciales
    this.updateProperties(context);
    
    // Renderizar el control
    this.renderControl();
  }

  /**
   * Actualizar las propiedades desde el contexto
   */
  private updateProperties(context: ComponentFramework.Context<IInputs>): void {
    this._buttonLabel = context.parameters.buttonLabel.raw || "Action Button";
    this._buttonType = Number.parseInt(context.parameters.buttonType.raw as any, 10) || 0;

    const rawShape = Number.parseInt(context.parameters.shape.raw as any, 10);
    this._shape = isNaN(rawShape) ? 0 : rawShape;

    const rawSize = Number.parseInt(context.parameters.buttonSize.raw as any, 10);
    this._buttonSize = isNaN(rawSize) ? 1 : rawSize;

    this._contextValue = context.parameters.contextValue.raw || null;
    this._jsFunctionName = context.parameters.jsFunctionName.raw || null;
    this._customApiLogicalName = context.parameters.customApiLogicalName.raw || null;
    this._fieldsToSend = context.parameters.fieldsToSend.raw || null;
    this._disabled = context.parameters.disabled.raw || false;
  }

  /**
   * Actualización del control cuando cambian los parámetros
   */
  public updateView(context: ComponentFramework.Context<IInputs>): void {
    this._context = context;
    this.updateProperties(context);
    this.renderControl();
  }

  /**
   * Renderizar el componente React
   */
  private renderControl(): void {
    const isPrimary = this._buttonType === 0;

    ReactDOM.render(
      React.createElement(ActionButtonComponent, {
        label: this._buttonLabel,
        isPrimary: isPrimary,
        shape: this._shape,
        size: this._buttonSize,
        disabled: this._disabled,
        onClick: this.handleButtonClick.bind(this),
      }),
      this._container
    );
  }

  /**
   * Manejador del clic del botón
   */
  private async handleButtonClick(): Promise<void> {
    try {
      // Prioridad 1: Ejecutar función JavaScript si está configurada
      if (this._jsFunctionName) {
        this.executeJavaScriptFunction(this._jsFunctionName);
        return;
      }

      // Prioridad 2: Ejecutar Custom API si está configurada
      if (this._customApiLogicalName) {
        await this.executeCustomApi(this._customApiLogicalName);
        return;
      }

      // Si no hay ninguna acción configurada, mostrar advertencia
      console.warn("ActionButton: No se ha configurado ninguna acción (función JS o Custom API)");
      
    } catch (error) {
      console.error("ActionButton - Error al ejecutar la acción:", error);
      
      // Mostrar notificación de error al usuario
      this._context.navigation.openAlertDialog({
        text: `Error al ejecutar la acción: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  }

  /**
   * Lee los campos del formulario indicados en fieldsToSend y devuelve sus valores.
   * Usa Xrm.Page para acceder a atributos de cualquier columna del formulario.
   */
  private readFieldValues(): Record<string, any> {
    const result: Record<string, any> = {};
    if (!this._fieldsToSend) return result;

    const xrm = (globalThis as any).Xrm;
    const formContext = xrm?.Page;
    if (!formContext) return result;

    const fieldNames = this._fieldsToSend.split(",").map((f: string) => f.trim()).filter(Boolean);
    for (const fieldName of fieldNames) {
      const attribute = formContext.getAttribute?.(fieldName);
      if (attribute) {
        result[fieldName] = attribute.getValue();
      } else {
        console.warn(`ActionButton: El campo '${fieldName}' no se encontró en el formulario`);
      }
    }
    return result;
  }

  /**
   * Ejecutar una función JavaScript global.
   * La función recibe: (executionContext, contextValue, fieldValues)
   * donde fieldValues es un objeto con los campos configurados en fieldsToSend.
   */
  private executeJavaScriptFunction(functionName: string): void {
    try {
      const xrm = (globalThis as any).Xrm;
      const formContext = xrm?.Page;
      const executionContext = {
        getFormContext: () => formContext,
        context: this._context,
      };

      // Parsear el nombre de la función (puede ser namespace.function)
      const functionParts = functionName.split(".");
      let fn: any = globalThis;

      for (const part of functionParts) {
        fn = fn[part];
        if (!fn) {
          throw new Error(`No se encontró la función: ${functionName}`);
        }
      }

      // Verificar que sea una función
      if (typeof fn !== "function") {
        throw new TypeError(`${functionName} no es una función válida`);
      }

      // Leer los campos configurados en fieldsToSend
      const fieldValues = this.readFieldValues();

      // Ejecutar la función: fn(executionContext, contextValue, fieldValues)
      fn(executionContext, this._contextValue, fieldValues);

      console.log(`ActionButton: Función ${functionName} ejecutada correctamente`, { contextValue: this._contextValue, fieldValues });

    } catch (error) {
      console.error(`Error al ejecutar la función JavaScript ${functionName}:`, error);
      throw error;
    }
  }

  /**
   * Ejecutar una Custom API
   */
  private async executeCustomApi(apiLogicalName: string): Promise<void> {
    try {
      const xrm = (globalThis as any).Xrm;

      // Leer los campos del formulario configurados en fieldsToSend
      const requestBody: Record<string, any> = this.readFieldValues();

      // Incluir contextValue si está configurado
      if (this._contextValue) {
        requestBody["contextValue"] = this._contextValue;
      }

      console.log(`ActionButton: Ejecutando Custom API ${apiLogicalName} con payload:`, requestBody);

      // Obtener la URL base del entorno
      const clientUrl: string = xrm?.Utility?.getGlobalContext?.()?.getClientUrl?.() ?? "";
      const apiUrl = `${clientUrl}/api/data/v9.2/${apiLogicalName}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          "OData-MaxVersion": "4.0",
          "OData-Version": "4.0",
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify(requestBody),
        credentials: "same-origin"
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData?.error?.message ?? errorMessage;
        } catch { /* ignorar error de parseo */ }
        throw new Error(errorMessage);
      }

      console.log(`ActionButton: Custom API ${apiLogicalName} ejecutada correctamente`);

      this._context.navigation.openAlertDialog({
        text: "La acción se ejecutó correctamente."
      });

      // Refrescar el formulario
      if (xrm?.Page?.data?.refresh) {
        xrm.Page.data.refresh(false);
      }

    } catch (error) {
      console.error(`Error al ejecutar la Custom API ${apiLogicalName}:`, error);
      throw error;
    }
  }

  /**
   * Obtener los valores de salida del control
   */
  public getOutputs(): IOutputs {
    return {
      disabled: this._disabled
    };
  }

  /**
   * Destruir el control y liberar recursos
   */
  public destroy(): void {
    ReactDOM.unmountComponentAtNode(this._container);
  }
}
