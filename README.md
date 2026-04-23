# Action Button PCF Control

Control PCF (PowerApps Component Framework) para Dynamics 365 que proporciona un botón personalizable basado en FluentUI con capacidad de ejecutar funciones JavaScript o Custom APIs.

## 🎯 Características

- ✅ Botón personalizable con estilos FluentUI (Primary/Secondary)
- ✅ Forma configurable: Rounded, Circular o Square
- ✅ Tamaño configurable: Small, Medium o Large
- ✅ Ejecuta funciones JavaScript personalizadas (recibe `executionContext`, `contextValue` y `fieldValues`)
- ✅ Ejecuta Custom APIs de Dynamics 365 con envío automático de campos del formulario
- ✅ **Indicador visual de loading** con spinner animado durante la ejecución
- ✅ **Campo de respuesta personalizable** para mostrar mensajes específicos de la API
- ✅ Totalmente configurable desde el diseñador de formularios moderno
- ✅ Soporte para deshabilitar el botón dinámicamente
- ✅ Manejo de errores y notificaciones al usuario

## 📋 Requisitos Previos

Antes de compilar el proyecto, necesitas tener instalado:

1. **Node.js** (versión 14 o superior)
   - Descarga: https://nodejs.org/

2. **PowerApps CLI** (Herramientas de PCF)
   ```powershell
   pac install latest
   ```
   O instalar el MSI desde: https://aka.ms/PowerAppsCLI

3. **Visual Studio Code** (recomendado)
   - Descarga: https://code.visualstudio.com/

## 🚀 Instalación y Compilación

### 1. Instalar dependencias

```powershell
npm install
```

### 2. Compilar el control

```powershell
npm run build
```

### 3. Probar en modo desarrollo (opcional)

```powershell
npm start
```

Esto abrirá el test harness en tu navegador para probar el control localmente.

### 4. Crear el paquete de solución para Dynamics 365

```powershell
# Crear directorio de solución
mkdir Solutions
cd Solutions
pac solution init --publisher-name TuPublisher --publisher-prefix tp

# Agregar referencia al control
pac solution add-reference --path ..

# Compilar el paquete
msbuild /t:build /restore
```

El archivo `.zip` generado estará en la carpeta `Solutions\bin\Debug`.

## 📦 Importar a Dynamics 365

1. Ir a **Power Apps** (make.powerapps.com)
2. Seleccionar tu entorno
3. Ir a **Soluciones** → **Importar solución**
4. Seleccionar el archivo `.zip` generado
5. Seguir el asistente de importación

## ⚙️ Configuración del Control

Una vez importado, puedes agregar el control a un formulario:

### 1. Editar el formulario

1. Ir a tu tabla (entidad) en Power Apps
2. Abrir el formulario donde quieres agregar el botón
3. Agregar un campo de texto de una sola línea (este será el campo vinculado)
4. Seleccionar el campo → **Propiedades**
5. En **Controles**, hacer clic en **+ Agregar control**
6. Seleccionar **Action Button**

### 2. Configurar las propiedades

El control tiene las siguientes propiedades configurables:

| Propiedad | Tipo | Uso | Requerido | Descripción |
|-----------|------|-----|-----------|-------------|
| **Button Label** | Texto | Input | Sí | Texto que se muestra en el botón |
| **Context Value** | Texto | Bound | No | Campo del formulario cuyo valor se pasa como segundo argumento a la función JS o a la Custom API |
| **Button Type** | Enum | Input | No | Estilo del botón: `Primary` (0) o `Secondary` (1) |
| **Shape** | Enum | Input | No | Forma del botón: `Rounded` (0), `Circular` (1) o `Square` (2) |
| **Button Size** | Enum | Input | No | Tamaño: `Small` (0), `Medium` (1) o `Large` (2) |
| **Web Resource** | Texto | Input | No | URL **completa** del Web Resource JavaScript a cargar antes de ejecutar la función (ej: `https://org.crm.dynamics.com/WebResources/ero_myscript.js`). Ver nota importante abajo |
| **JavaScript Function Name** | Texto | Input | No | Nombre de la función JS global a ejecutar (ej: `MyNS.myFunction`) |
| **Custom API Logical Name** | Texto | Input | No | Logical name de la Custom API a ejecutar |
| **Fields To Send** | Texto | Input | No | Nombres lógicos separados por comas de los campos del formulario que se enviarán como parámetros a la Custom API (ej: `name,telephone1,emailaddress1`) |
| **Response Field To Show** | Texto | Input | No | Nombre del campo de la respuesta JSON de la Custom API que se mostrará en el mensaje de éxito (ej: `message`, `result`). Si no se especifica, muestra un mensaje genérico |
| **Disabled** | Sí/No | Bound | No | Indica si el botón está deshabilitado. Puede vincularse a una columna Sí/No de la tabla |

> **Nota**: `Context Value` es un campo `Bound` (vinculado a una columna del formulario). Es necesario para que el control funcione en el **diseñador de formularios moderno**. Su valor se pasa automáticamente a la función JS y a la Custom API.

> ⚠️ **Importante - Web Resource URL**: El PCF se ejecuta dentro de un iframe con un origen diferente al de la aplicación. Por eso **no funcionan rutas relativas** como `/WebResources/ero_myscript.js`. Debes usar siempre la **URL absoluta completa** del entorno:
> ```
> https://<org>.crm4.dynamics.com/WebResources/ero_myscript.js
> ```
> Puedes obtener la URL base desde: Power Apps → Configuración → Recursos para desarrolladores → URL raíz del servicio web.

### 🔄 Indicador de Loading

Cuando se hace clic en el botón y se ejecuta una acción:
- El botón muestra un **spinner animado** (rueda de progreso)
- El texto cambia a **"Procesando..."**
- El botón se **deshabilita automáticamente** para evitar múltiples clics
- Una vez completada la acción, el botón vuelve a su estado normal

Esto proporciona feedback visual inmediato al usuario de que la acción se está procesando.

### 3. Ejemplos de configuración

#### Ejemplo 1: Ejecutar una función JavaScript desde un Web Resource externo

Puedes cargar un Web Resource JavaScript externo para que sus funciones estén disponibles al pulsar el botón. La función recibe tres parámetros: `executionContext` (contexto del formulario), `contextValue` (el valor del campo vinculado), y `fieldValues` (objeto con los campos configurados en `Fields To Send`).

```javascript
// En tu Web Resource JavaScript (ej: ero_myscript.js)
let MyNamespace = MyNamespace || {};

MyNamespace.validateRecord = function(executionContext, contextValue, fieldValues) {
    let formContext = executionContext.getFormContext();
    
    // contextValue contiene el valor del campo vinculado en "Context Value"
    console.log("Valor del contexto:", contextValue);
    
    // fieldValues contiene los campos configurados en "Fields To Send"
    console.log("Campos enviados:", fieldValues);
    
    let accountName = formContext.getAttribute("name").getValue();
    
    if (!accountName) {
        Xrm.Navigation.openAlertDialog({
            text: "Por favor, ingresa un nombre de cuenta"
        });
        return;
    }
    
    Xrm.Navigation.openAlertDialog({
        text: "Registro validado correctamente"
    });
};
```

**Configuración del control:**
- Button Label: `Validar Registro`
- Button Type: `Primary`
- Shape: `Rounded`
- Button Size: `Medium`
- **Web Resource**: `https://<org>.crm4.dynamics.com/WebResources/ero_myscript.js` *(URL completa obligatoria)*
- **JavaScript Function Name**: `MyNamespace.validateRecord`
- Context Value: *(vincular a un campo del formulario, o dejar vacío)*

> Si la función ya está cargada en el formulario mediante las Bibliotecas de formulario habituales, no es necesario rellenar **Web Resource** — basta con poner el nombre de la función.

#### Ejemplo 2: Ejecutar una Custom API con campos del formulario y respuesta personalizada

Puedes enviar múltiples campos del formulario a tu Custom API usando `Fields To Send` y mostrar un campo específico de la respuesta:

**Configuración del control:**
- Button Label: `Calcular Descuento`
- Button Type: `Primary`
- Custom API Logical Name: `ero_CalculateDiscount`
- Fields To Send: `quantity,unitprice,discountpercentage`
- Response Field To Show: `message`
- Context Value: *(vincular al campo donde estará el resultado, por ejemplo `discountamount`)*

La Custom API recibirá un request con los parámetros:
```
quantity        → valor del campo "quantity" del formulario
unitprice       → valor del campo "unitprice" del formulario
discountpercentage → valor del campo "discountpercentage" del formulario
contextValue    → valor actual del campo vinculado en "Context Value"
```

Si tu Custom API retorna una respuesta JSON como:
```json
{
  "status": "success",
  "message": "Descuento calculado: $150.00",
  "discountAmount": 150.00
}
```

El usuario verá el mensaje: **"Descuento calculado: $150.00"** (el valor del campo `message`). Si no configuras `Response Field To Show`, se mostrará el mensaje genérico "La acción se ejecutó correctamente."

#### Ejemplo 3: Botón circular y pequeño (icono-like)

Útil para botones de acción compactos junto a otros controles:

- Button Label: `✓`
- Button Type: `Primary`
- Shape: `Circular`
- Button Size: `Small`
- JavaScript Function Name: `MyNamespace.quickApprove`

#### Ejemplo 4: Deshabilitar dinámicamente el botón

Vincula la propiedad `Disabled` a una columna **Sí/No** de la tabla directamente desde el diseñador de formularios (activar el checkbox "Enlazar a columna de tabla"), o controla el estado mediante una regla de negocio sobre esa columna:

```javascript
// El botón siempre está activo, pero la función comprueba el estado
MyNamespace.checkAndExecute = function(executionContext, contextValue) {
    let formContext = executionContext.getFormContext();
    let status = formContext.getAttribute("statecode").getValue();
    
    if (status !== 0) {
        Xrm.Navigation.openAlertDialog({ text: "Solo se puede ejecutar en registros activos." });
        return;
    }
    
    // Continuar con la lógica...
};
```

## 🔧 Orden de Ejecución

Cuando se hace clic en el botón, las acciones se ejecutan **secuencialmente** en este orden:

1. **Web Resource** — Si está configurado, se carga el script externo (solo la primera vez; las siguientes se reutiliza el que ya está en el DOM)
2. **Función JavaScript** — Si está configurada, se ejecuta una vez que el script esté disponible
3. **Custom API** — Si está configurada, se ejecuta siempre **después** de la función JS (aunque también haya función JS)
4. **Sin acción** — Si no hay ninguna de las dos configuradas, se muestra una advertencia en consola

Esto permite combinar ambas: por ejemplo, ejecutar una validación JS local y luego llamar a una Custom API del servidor en el mismo clic.

## 🐛 Solución de Problemas

### El botón no se muestra

- Verifica que el control esté habilitado para Web, Phone y Tablet
- Asegúrate de que el campo esté visible en el formulario
- Revisa la consola del navegador para errores

### Error al cargar el Web Resource

- Asegúrate de usar la **URL absoluta completa** (ej: `https://<org>.crm4.dynamics.com/WebResources/ero_myscript.js`). Las rutas relativas como `/WebResources/...` no funcionan dentro del iframe del PCF
- Verifica que el Web Resource esté publicado en el entorno
- Comprueba en la consola del navegador si hay errores de CORS o 404
- El Web Resource debe ser de tipo **Script (JScript)**

### Error al ejecutar función JavaScript

- Verifica que el nombre de la función sea correcto (case-sensitive)
- Si no usas **Web Resource**, asegúrate de que la biblioteca esté agregada a las **Bibliotecas de formulario**
- La función debe estar disponible en el contexto global (`window`)
- La función debe aceptar los parámetros `(executionContext, contextValue, fieldValues)`

### Error al ejecutar Custom API

- Verifica que el logical name sea correcto
- Asegúrate de que la Custom API esté publicada
- Revisa los permisos de seguridad del usuario
- El usuario debe tener permisos para ejecutar la Custom API

### El botón no responde a clics

- Verifica que la propiedad `Disabled` no esté en `true`
- Revisa la consola del navegador para errores
- Asegúrate de que no haya reglas de negocio que bloqueen el formulario

## 📝 Estructura del Proyecto

```
ActionButton/
│
├── index.ts                      # Lógica principal del control
├── ControlManifest.Input.xml     # Definición del control y propiedades
├── package.json                  # Dependencias npm
├── tsconfig.json                 # Configuración TypeScript
├── ActionButton.pcfproj          # Archivo de proyecto PCF
├── .gitignore                    # Archivos ignorados por Git
│
├── strings/
│   └── ActionButton.1033.resx    # Recursos de texto (inglés)
│
└── README.md                     # Esta documentación
```

## 🤝 Contribuciones

Si encuentras un bug o tienes una sugerencia de mejora, por favor crea un issue o pull request.

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## 📚 Recursos Adicionales

- [Documentación oficial de PCF](https://docs.microsoft.com/en-us/powerapps/developer/component-framework/overview)
- [FluentUI React Components](https://developer.microsoft.com/en-us/fluentui#/controls/web)
- [Custom APIs en Dynamics 365](https://docs.microsoft.com/en-us/powerapps/developer/data-platform/custom-api)
- [Web API de Dynamics 365](https://docs.microsoft.com/en-us/powerapps/developer/data-platform/webapi/overview)

## 👨‍💻 Autor

**Pablo Fernández Carbayo**
- LinkedIn: [Pablo Fernández Carbayo](https://www.linkedin.com/in/pablo-fernandez-carbayo-505b11141/)

Desarrollado para Dynamics 365

---

**¡Disfruta usando el Action Button PCF Control!** 🚀
