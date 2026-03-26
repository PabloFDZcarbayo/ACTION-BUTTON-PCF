/**
 * EJEMPLO DE FUNCIÓN JAVASCRIPT PARA USAR CON EL ACTION BUTTON PCF
 * 
 * Este archivo contiene ejemplos de funciones que puedes usar
 * con el control Action Button.
 * 
 * IMPORTANTE: Este archivo debe ser subido como Web Resource a Dynamics 365
 * y agregado a tu formulario para que las funciones estén disponibles.
 */

// Crear un namespace para evitar conflictos
let ActionButtonExamples = ActionButtonExamples || {};

/**
 * Ejemplo 1: Validar campos requeridos antes de guardar
 */
ActionButtonExamples.validateRequiredFields = function(executionContext) {
    let formContext = executionContext.getFormContext();
    
    // Lista de campos a validar
    let requiredFields = ["name", "telephone1", "emailaddress1"];
    let missingFields = [];
    
    requiredFields.forEach(function(fieldName) {
        let attribute = formContext.getAttribute(fieldName);
        if (attribute && !attribute.getValue()) {
            missingFields.push(attribute.getName());
        }
    });
    
    if (missingFields.length > 0) {
        Xrm.Navigation.openAlertDialog({
            text: "Por favor completa los siguientes campos: " + missingFields.join(", "),
            title: "Campos Requeridos"
        });
    } else {
        Xrm.Navigation.openAlertDialog({
            text: "Todos los campos requeridos están completos",
            title: "Validación Exitosa"
        });
    }
};

/**
 * Ejemplo 2: Calcular un valor basado en otros campos
 */
ActionButtonExamples.calculateTotal = function(executionContext) {
    let formContext = executionContext.getFormContext();
    
    // Obtener valores
    let quantity = formContext.getAttribute("quantity").getValue() || 0;
    let unitPrice = formContext.getAttribute("unitprice").getValue() || 0;
    let discount = formContext.getAttribute("discount").getValue() || 0;
    
    // Calcular total
    let subtotal = quantity * unitPrice;
    let total = subtotal - (subtotal * (discount / 100));
    
    // Establecer el valor calculado
    formContext.getAttribute("totalamount").setValue(total);
    
    Xrm.Navigation.openAlertDialog({
        text: "Total calculado: $" + total.toFixed(2),
        title: "Cálculo Completado"
    });
};

/**
 * Ejemplo 3: Abrir un diálogo de confirmación antes de realizar una acción
 */
ActionButtonExamples.confirmAndExecute = function(executionContext) {
    let formContext = executionContext.getFormContext();
    
    let confirmStrings = {
        text: "¿Estás seguro de que deseas continuar con esta acción?",
        title: "Confirmación"
    };
    
    let confirmOptions = {
        height: 200,
        width: 450
    };
    
    Xrm.Navigation.openConfirmDialog(confirmStrings, confirmOptions).then(
        function(result) {
            if (result.confirmed) {
                // Usuario confirmó - realizar la acción
                ActionButtonExamples.performAction(formContext);
            } else {
                // Usuario canceló
                console.log("Acción cancelada por el usuario");
            }
        }
    );
};

/**
 * Función auxiliar para realizar una acción
 */
ActionButtonExamples.performAction = function(formContext) {
    // Aquí va tu lógica de negocio
    Xrm.Navigation.openAlertDialog({
        text: "Acción ejecutada correctamente",
        title: "Éxito"
    });
};

/**
 * Ejemplo 4: Navegar a otro registro
 */
ActionButtonExamples.openRelatedRecord = function(executionContext) {
    let formContext = executionContext.getFormContext();
    
    // Obtener el ID del registro relacionado
    let relatedRecord = formContext.getAttribute("parentaccountid").getValue();
    
    if (relatedRecord && relatedRecord.length > 0) {
        let entityFormOptions = {
            entityName: relatedRecord[0].entityType,
            entityId: relatedRecord[0].id
        };
        
        Xrm.Navigation.openForm(entityFormOptions);
    } else {
        Xrm.Navigation.openAlertDialog({
            text: "No hay registro relacionado para abrir",
            title: "Información"
        });
    }
};

/**
 * Ejemplo 5: Ejecutar una acción del servidor con Web API
 */
ActionButtonExamples.executeCustomAction = function(executionContext) {
    let formContext = executionContext.getFormContext();
    let recordId = formContext.data.entity.getId().replace("{", "").replace("}", "");
    let entityName = formContext.data.entity.getEntityName();
    
    // Mostrar indicador de carga
    Xrm.Utility.showProgressIndicator("Ejecutando acción...");
    
    // Construir la solicitud
    let target = {
        "@odata.type": "Microsoft.Dynamics.CRM." + entityName,
        [entityName + "id"]: recordId
    };
    
    let requestData = {
        Target: target
    };
    
    // Nombre de tu acción personalizada
    let actionName = "tu_AccionPersonalizada";
    
    // Ejecutar la acción
    let req = {};
    req.Target = target;
    req.getMetadata = function() {
        return {
            boundParameter: null,
            operationType: 0, // Action
            operationName: actionName,
            parameterTypes: {
                "Target": {
                    "typeName": "mscrm." + entityName,
                    "structuralProperty": 5 // Entity
                }
            }
        };
    };
    
    Xrm.WebApi.online.execute(req).then(
        function(result) {
            if (result.ok) {
                return result.json();
            }
        }
    ).then(
        function(responseBody) {
            Xrm.Utility.closeProgressIndicator();
            Xrm.Navigation.openAlertDialog({
                text: "Acción ejecutada correctamente",
                title: "Éxito"
            });
            
            // Refrescar el formulario
            formContext.data.refresh();
        }
    ).catch(
        function(error) {
            Xrm.Utility.closeProgressIndicator();
            Xrm.Navigation.openAlertDialog({
                text: "Error al ejecutar la acción: " + error.message,
                title: "Error"
            });
            console.error("Error:", error);
        }
    );
};

/**
 * Ejemplo 6: Bloquear/Desbloquear campos del formulario
 */
ActionButtonExamples.toggleFieldsLock = function(executionContext) {
    let formContext = executionContext.getFormContext();
    
    // Lista de campos a bloquear/desbloquear
    let fieldsToToggle = ["name", "telephone1", "emailaddress1"];
    
    fieldsToToggle.forEach(function(fieldName) {
        let control = formContext.getControl(fieldName);
        if (control) {
            let isDisabled = control.getDisabled();
            control.setDisabled(!isDisabled);
        }
    });
    
    Xrm.Navigation.openAlertDialog({
        text: "Estado de los campos actualizado",
        title: "Información"
    });
};

/**
 * Ejemplo 7: Actualizar un campo y guardar el formulario
 */
ActionButtonExamples.updateAndSave = function(executionContext) {
    let formContext = executionContext.getFormContext();
    
    // Actualizar un campo (ejemplo: fecha de última revisión)
    formContext.getAttribute("lastreviewed").setValue(new Date());
    
    // Guardar el formulario
    formContext.data.save().then(
        function() {
            Xrm.Navigation.openAlertDialog({
                text: "Registro actualizado y guardado correctamente",
                title: "Éxito"
            });
        },
        function(error) {
            Xrm.Navigation.openAlertDialog({
                text: "Error al guardar: " + error.message,
                title: "Error"
            });
        }
    );
};

/**
 * Ejemplo 8: Usar contextValue para pasar datos al handler
 *
 * El parámetro "Context Value" del control permite vincular cualquier campo
 * del formulario. Su valor se recibe como segundo argumento en la función JS
 * y también se envía automáticamente a la Custom API como parámetro "contextValue".
 *
 * Caso de uso: el botón "Aprobar" vincula la columna "ero_approvallevel" (p.ej. "Manager")
 * y la función usa ese valor para determinar qué lógica ejecutar.
 *
 * Configuración del control:
 *   JavaScript Function Name : ActionButtonExamples.processWithContext
 *   Context Value            : (vincular a la columna "ero_approvallevel")
 */
ActionButtonExamples.processWithContext = function(executionContext, contextValue) {
    let formContext = executionContext.getFormContext();
    let recordId = formContext.data.entity.getId().replace(/[{}]/g, "");
    let entityName = formContext.data.entity.getEntityName();

    // contextValue es el valor actual del campo vinculado en "Context Value"
    // Por ejemplo: "Manager", "1500", o cualquier valor de texto del formulario
    console.log("[ActionButton] contextValue recibido:", contextValue);

    if (!contextValue) {
        Xrm.Navigation.openAlertDialog({
            text: "No hay valor de contexto configurado para este botón.",
            title: "Aviso"
        });
        return;
    }

    Xrm.Utility.showProgressIndicator("Procesando...");

    // Ejemplo: llamar a una Custom API pasando contextValue como parámetro adicional
    let request = {
        entityName: entityName,
        entityId: recordId,
        level: contextValue,          // valor del campo vinculado
        getMetadata: function() {
            return {
                boundParameter: null,
                operationType: 0,
                operationName: "ero_ProcessWithLevel",
                parameterTypes: {
                    "entityName": { typeName: "Edm.String", structuralProperty: 1 },
                    "entityId":   { typeName: "Edm.String", structuralProperty: 1 },
                    "level":      { typeName: "Edm.String", structuralProperty: 1 }
                }
            };
        }
    };

    Xrm.WebApi.online.execute(request).then(
        function(result) {
            Xrm.Utility.closeProgressIndicator();
            Xrm.Navigation.openAlertDialog({
                text: "Procesado correctamente (nivel: " + contextValue + ")",
                title: "Éxito"
            });
            formContext.data.refresh(false);
        },
        function(error) {
            Xrm.Utility.closeProgressIndicator();
            Xrm.Navigation.openAlertDialog({
                text: "Error: " + error.message,
                title: "Error"
            });
            console.error("[ActionButton] Error en processWithContext:", error);
        }
    );
};

/**
 * Ejemplo 8: Compartir registro con otro usuario/equipo
 */
ActionButtonExamples.shareRecord = function(executionContext) {
    let formContext = executionContext.getFormContext();
    let recordId = formContext.data.entity.getId().replace("{", "").replace("}", "");
    let entityName = formContext.data.entity.getEntityName();
    
    // Aquí deberías abrir un diálogo para seleccionar el usuario/equipo
    // Este es un ejemplo simplificado
    
    let userId = "USER-GUID-HERE"; // Reemplazar con el GUID del usuario
    
    if (!userId) {
        Xrm.Navigation.openAlertDialog({
            text: "Configura el ID del usuario con quien compartir",
            title: "Configuración Necesaria"
        });
        return;
    }
    
    // Preparar la petición GrantAccess
    let grantAccessRequest = {
        Target: {
            "@odata.type": "Microsoft.Dynamics.CRM." + entityName,
            [entityName + "id"]: recordId
        },
        PrincipalAccess: {
            Principal: {
                "@odata.type": "Microsoft.Dynamics.CRM.systemuser",
                systemuserid: userId
            },
            AccessMask: "ReadAccess,WriteAccess"
        },
        getMetadata: function() {
            return {
                boundParameter: null,
                operationType: 0,
                operationName: "GrantAccess",
                parameterTypes: {
                    Target: { typeName: "mscrm.crmbaseentity", structuralProperty: 5 },
                    PrincipalAccess: { typeName: "mscrm.principalaccess", structuralProperty: 5 }
                }
            };
        }
    };
    
    Xrm.WebApi.online.execute(grantAccessRequest).then(
        function() {
            Xrm.Navigation.openAlertDialog({
                text: "Registro compartido correctamente",
                title: "Éxito"
            });
        },
        function(error) {
            Xrm.Navigation.openAlertDialog({
                text: "Error al compartir: " + error.message,
                title: "Error"
            });
        }
    );
};

/**
 * INSTRUCCIONES DE USO:
 * 
 * 1. Sube este archivo como Web Resource a Dynamics 365:
 *    - Nombre sugerido: "tp_ActionButtonExamples.js" (reemplaza 'tp' con tu prefijo)
 *    
 * 2. Agrega el Web Resource a tu formulario:
 *    - Editar formulario → Propiedades del formulario
 *    - Biblioteca de formularios → Agregar
 *    - Seleccionar el Web Resource
 *    
 * 3. Configura el Action Button PCF:
 *    - JavaScript Function Name: "ActionButtonExamples.validateRequiredFields"
 *    - (O cualquier otra función de este archivo)
 *    
 * 4. Personaliza las funciones según tus necesidades de negocio.
 */
