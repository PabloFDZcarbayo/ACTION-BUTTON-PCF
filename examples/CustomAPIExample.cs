/**
 * EJEMPLO DE CUSTOM API PARA DYNAMICS 365
 * 
 * Este archivo contiene un ejemplo de cómo crear una Custom API
 * que puede ser llamada desde el Action Button PCF Control.
 * 
 * Las Custom APIs se crean directamente en Dynamics 365, no necesitan
 * código compilado (aunque puedes usar plugins para la lógica).
 */

/*
 * =============================================================================
 * PASO 1: CREAR LA CUSTOM API EN DYNAMICS 365
 * =============================================================================
 * 
 * Puedes crear una Custom API de varias maneras:
 * 
 * Opción A: Mediante la interfaz de usuario (Power Apps)
 * --------------------------------------------------------
 * 1. Ve a https://make.powerapps.com
 * 2. Selecciona tu entorno
 * 3. Datasets → Tables → Custom APIs (o busca "customapi" en el buscador)
 * 4. Crea un nuevo registro con estos valores:
 * 
 *    - Unique Name: tp_CalculateDiscount
 *    - Display Name: Calculate Discount
 *    - Binding Type: Entity (si quieres que opere sobre un registro específico)
 *    - Bound Entity Logical Name: account (o tu entidad)
 *    - Execute Privilege Name: (dejar vacío para acceso público)
 *    - Is Function: No
 *    - Is Private: No
 *    - Allowed Custom Processing Step Type: Async and Sync
 * 
 * 5. Crea parámetros de entrada/salida si es necesario
 * 
 * 
 * Opción B: Mediante código (Solution XML)
 * ----------------------------------------
 * Agrega esto a tu archivo Solution.xml:
 */

/*
<?xml version="1.0" encoding="utf-8"?>
<ImportExportXml xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <customapis>
    <customapi>
      <allowedcustomprocessingsteptype>0</allowedcustomprocessingsteptype>
      <bindingtype>1</bindingtype>
      <boundentitylogicalname>account</boundentitylogicalname>
      <description>Calcula el descuento para una cuenta</description>
      <displayname>Calculate Discount</displayname>
      <executeprivilegename></executeprivilegename>
      <isfunction>0</isfunction>
      <isprivate>0</isprivate>
      <name>tp_CalculateDiscount</name>
      <uniquename>tp_CalculateDiscount</uniquename>
    </customapi>
  </customapis>
  
  <customapirequestparameters>
    <!-- Parámetro de entrada: Porcentaje de descuento -->
    <customapirequestparameter>
      <customapiid>tp_CalculateDiscount</customapiid>
      <description>Porcentaje de descuento a aplicar</description>
      <displayname>Discount Percentage</displayname>
      <isoptional>0</isoptional>
      <logicalentityname></logicalentityname>
      <name>DiscountPercentage</name>
      <type>3</type> <!-- 3 = Decimal -->
      <uniquename>DiscountPercentage</uniquename>
    </customapirequestparameter>
  </customapirequestparameters>
  
  <customapiresponseparameters>
    <!-- Parámetro de salida: Monto del descuento -->
    <customapiresponseparameter>
      <customapiid>tp_CalculateDiscount</customapiid>
      <description>Monto calculado del descuento</description>
      <displayname>Discount Amount</displayname>
      <logicalentityname></logicalentityname>
      <name>DiscountAmount</name>
      <type>3</type> <!-- 3 = Decimal -->
      <uniquename>DiscountAmount</uniquename>
    </customapiresponseparameter>
  </customapiresponseparameters>
</ImportExportXml>
*/

/*
 * =============================================================================
 * PASO 2: CREAR LA LÓGICA (PLUGIN) - OPCIONAL
 * =============================================================================
 * 
 * Si necesitas lógica personalizada, crea un Plugin en C#:
 */

/*
using System;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Extensions;

namespace YourNamespace.Plugins
{
    public class CalculateDiscountPlugin : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            // Obtener el contexto de ejecución
            var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            var service = serviceFactory.CreateOrganizationService(context.UserId);
            var tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
            
            try
            {
                tracingService.Trace("CalculateDiscountPlugin: Iniciando ejecución");
                
                // Obtener parámetros de entrada
                if (!context.InputParameters.Contains("Target"))
                    throw new InvalidPluginExecutionException("Target entity not found");
                    
                var target = (EntityReference)context.InputParameters["Target"];
                
                decimal discountPercentage = 0;
                if (context.InputParameters.Contains("DiscountPercentage"))
                {
                    discountPercentage = (decimal)context.InputParameters["DiscountPercentage"];
                }
                
                tracingService.Trace($"Porcentaje de descuento: {discountPercentage}");
                
                // Obtener el registro de la cuenta
                var account = service.Retrieve(target.LogicalName, target.Id, 
                    new Microsoft.Xrm.Sdk.Query.ColumnSet("revenue"));
                
                if (!account.Contains("revenue") || account["revenue"] == null)
                {
                    throw new InvalidPluginExecutionException("La cuenta no tiene un valor de ingresos (revenue)");
                }
                
                var revenue = (Money)account["revenue"];
                
                // Calcular el descuento
                decimal discountAmount = revenue.Value * (discountPercentage / 100);
                
                tracingService.Trace($"Monto de descuento calculado: {discountAmount}");
                
                // Establecer parámetro de salida
                context.OutputParameters["DiscountAmount"] = discountAmount;
                
                // Opcional: Actualizar el registro
                var updateAccount = new Entity(target.LogicalName, target.Id);
                updateAccount["description"] = $"Descuento aplicado: {discountPercentage}% = ${discountAmount}";
                service.Update(updateAccount);
                
                tracingService.Trace("CalculateDiscountPlugin: Ejecución completada");
            }
            catch (Exception ex)
            {
                tracingService.Trace($"Error en CalculateDiscountPlugin: {ex.Message}");
                throw new InvalidPluginExecutionException($"Error al calcular descuento: {ex.Message}", ex);
            }
        }
    }
}
*/

/*
 * =============================================================================
 * PASO 3: REGISTRAR EL PLUGIN
 * =============================================================================
 * 
 * Usa el Plugin Registration Tool:
 * 
 * 1. Registrar el Assembly (tu DLL compilada)
 * 2. Registrar el Plugin:
 *    - Message: tp_CalculateDiscount (el nombre de tu Custom API)
 *    - Primary Entity: account
 *    - Stage: Post-operation (40)
 *    - Mode: Synchronous
 * 
 * O mediante código en tu solución:
 */

/*
<SdkMessageProcessingSteps>
  <SdkMessageProcessingStep>
    <Name>CalculateDiscount: tp_CalculateDiscount of account</Name>
    <Description>Calcula el descuento para una cuenta</Description>
    <Mode>0</Mode> <!-- 0 = Synchronous -->
    <Rank>1</Rank>
    <Stage>40</Stage> <!-- 40 = Post-operation -->
    <SdkMessageId>tp_CalculateDiscount</SdkMessageId>
    <Configuration></Configuration>
    <FilteringAttributes></FilteringAttributes>
  </SdkMessageProcessingStep>
</SdkMessageProcessingSteps>
*/

/*
 * =============================================================================
 * PASO 4: USAR DESDE EL ACTION BUTTON
 * =============================================================================
 * 
 * Configura el Action Button PCF:
 * 
 * - Button Label: "Calcular Descuento"
 * - Button Type: Primary
 * - Custom API Logical Name: "tp_CalculateDiscount"
 * 
 * El control automáticamente:
 * 1. Obtiene el registro actual (Target)
 * 2. Llama a la Custom API
 * 3. Muestra notificación de éxito/error
 * 4. Refresca el formulario
 */

/*
 * =============================================================================
 * EJEMPLO COMPLETO: CUSTOM API SIN PLUGIN (WORKFLOW/POWER AUTOMATE)
 * =============================================================================
 * 
 * Si no quieres crear un plugin, puedes usar Power Automate:
 * 
 * 1. Crea una Custom API como se indicó arriba
 * 2. En vez de plugin, crea un Power Automate Flow:
 * 
 * Trigger: "When an action is performed" (Dataverse)
 *   - Catalog: Custom API
 *   - Action Name: tp_CalculateDiscount
 * 
 * Actions:
 *   - Get the account record
 *   - Calculate the discount
 *   - Update the account
 *   - Return response
 * 
 * 3. El Action Button llamará automáticamente a este Flow
 */

/*
 * =============================================================================
 * EJEMPLO: CUSTOM API SIMPLE (SIN PARÁMETROS)
 * =============================================================================
 * 
 * Para empezar rápido, crea una Custom API simple:
 * 
 * 1. Unique Name: tp_RefreshData
 * 2. Display Name: Refresh Data
 * 3. Binding Type: Entity
 * 4. Bound Entity: tu entidad (ej: account)
 * 5. No necesitas parámetros ni plugin para probar
 * 
 * El Action Button ejecutará la API y mostrará un mensaje de éxito.
 * Puedes agregar lógica después con un Plugin o Flow.
 */

/*
 * =============================================================================
 * TIPS Y MEJORES PRÁCTICAS
 * =============================================================================
 * 
 * 1. Nombres: Usa siempre un prefijo (ej: tp_) para tu publisher
 * 
 * 2. Seguridad: 
 *    - Define Execute Privilege Name para controlar quién puede ejecutar
 *    - Usa Security Roles para dar permisos
 * 
 * 3. Error Handling:
 *    - Usa try-catch en plugins
 *    - Retorna mensajes de error descriptivos
 *    - Registra en el tracing service para debugging
 * 
 * 4. Performance:
 *    - Usa operaciones asíncronas si son largas (isAsync = true)
 *    - Limita las queries a solo campos necesarios
 * 
 * 5. Testing:
 *    - Prueba primero en Sandbox
 *    - Usa el Plugin Registration Tool para ver traces
 *    - Verifica en diferentes contextos (create, update, etc.)
 */

/*
 * =============================================================================
 * DOCUMENTACIÓN OFICIAL
 * =============================================================================
 * 
 * - Custom API Overview:
 *   https://docs.microsoft.com/en-us/power-apps/developer/data-platform/custom-api
 * 
 * - Create Custom API:
 *   https://docs.microsoft.com/en-us/power-apps/developer/data-platform/create-custom-api-solution
 * 
 * - Plugin Development:
 *   https://docs.microsoft.com/en-us/power-apps/developer/data-platform/plug-ins
 */
