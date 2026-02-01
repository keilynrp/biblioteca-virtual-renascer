# Pull Request

## 📝 Descripción

<!-- Proporciona una descripción clara y concisa de los cambios realizados -->

## 🔗 Issue Relacionado

<!-- Enlaza al issue que este PR resuelve. Si no hay issue, crea uno primero. -->
Closes #(issue number)

## 🎯 Tipo de Cambio

<!-- Marca con una X las opciones que apliquen -->

- [ ] 🐛 Bug fix (cambio que corrige un issue)
- [ ] ✨ Nueva funcionalidad (cambio que agrega funcionalidad)
- [ ] 💥 Breaking change (cambio que rompe compatibilidad con versiones anteriores)
- [ ] 🎨 Mejora de UI/UX
- [ ] ♻️ Refactorización (mejora de código sin cambiar funcionalidad)
- [ ] ⚡ Mejora de performance
- [ ] 📚 Documentación
- [ ] 🧪 Tests
- [ ] 🔧 Configuración/DevOps
- [ ] 🔒 Seguridad

## ✅ ¿Cómo se ha probado?

<!-- Describe las pruebas realizadas para verificar los cambios -->

- [ ] Test unitarios
- [ ] Test de integración
- [ ] Test E2E
- [ ] Prueba manual
- [ ] No requiere testing (solo docs, etc.)

### Detalles de Testing

<!-- Describe los tests específicos realizados -->

```
# Comandos ejecutados:

```

## 📸 Screenshots

<!-- Si aplica, agrega screenshots del before/after o de la nueva funcionalidad -->

<details>
<summary>Ver screenshots</summary>

**Antes:**


**Después:**


</details>

## ✨ Cambios Realizados

<!-- Lista detallada de los cambios -->

### Backend
-
-

### Frontend
-
-

### Database
-
-

### Otros
-
-

## 📋 Checklist

<!-- Marca con una X las opciones completadas -->

### Código
- [ ] Mi código sigue los estándares del proyecto
- [ ] He realizado auto-revisión del código
- [ ] He comentado el código en áreas complejas
- [ ] Mis cambios no generan warnings
- [ ] El código pasa el linter (ESLint/Flake8)

### Tests
- [ ] He agregado tests que prueban mi fix/feature
- [ ] Tests nuevos y existentes pasan localmente
- [ ] Coverage cumple con los objetivos (Backend: 80%, Frontend: 70%)

### Documentación
- [ ] He actualizado la documentación relevante
- [ ] He actualizado el CHANGELOG.md
- [ ] He agregado comentarios JSDoc/Docstrings donde corresponde
- [ ] He actualizado README si es necesario

### Database
- [ ] He creado migraciones necesarias
- [ ] Las migraciones son reversibles
- [ ] He probado las migraciones en ambiente limpio

### Commits
- [ ] Mis commits siguen Conventional Commits
- [ ] Los commits son atómicos y tienen mensajes descriptivos

### Review
- [ ] He revisado mi PR yo mismo primero
- [ ] He probado los cambios localmente
- [ ] He verificado que no hay conflictos con main
- [ ] He verificado que CI/CD pasa exitosamente

## 🔄 Cambios Dependientes

<!-- ¿Este PR depende de otros PRs o issues? -->

- Depende de: #
- Bloquea: #
- Relacionado con: #

## 🚀 Deployment

<!-- ¿Hay consideraciones especiales para el deployment? -->

- [ ] Requiere actualizar variables de entorno
- [ ] Requiere ejecutar migraciones
- [ ] Requiere actualizar dependencias
- [ ] Requiere cambios en configuración de servidor
- [ ] No requiere acciones especiales

### Notas de Deployment

<!-- Instrucciones especiales para deployment -->

```bash
# Comandos necesarios:

```

## 📝 Notas para Revisores

<!-- Información adicional para los revisores -->

### Áreas de Foco

<!-- En qué deberían enfocarse los revisores -->

-
-

### Decisiones de Diseño

<!-- Explica decisiones de diseño importantes -->

-
-

### Posibles Riesgos

<!-- Identifica posibles riesgos o efectos secundarios -->

-
-

## 🎓 Aprendizajes

<!-- (Opcional) ¿Qué aprendiste haciendo este cambio? -->

-
-

## 📊 Métricas

<!-- Si aplica, incluye métricas relevantes -->

### Performance

- **Tiempo de carga**: antes X ms → después Y ms
- **Tamaño del bundle**: antes X KB → después Y KB
- **Queries DB**: optimización de N+1, etc.

### Coverage

- **Backend**: X% → Y%
- **Frontend**: X% → Y%

---

<details>
<summary>📌 Plantilla de Revisión para Reviewers</summary>

### Checklist de Revisión

- [ ] El código es claro y fácil de entender
- [ ] Los cambios cumplen el propósito del PR
- [ ] No hay código duplicado innecesariamente
- [ ] Las funciones son pequeñas y enfocadas
- [ ] Los nombres de variables/funciones son descriptivos
- [ ] No hay lógica innecesariamente compleja
- [ ] Se manejan apropiadamente los errores
- [ ] No hay vulnerabilidades de seguridad obvias
- [ ] Los tests cubren los casos edge
- [ ] La documentación es clara y completa

</details>

---

## 📝 Comentarios del Autor

<!-- Cualquier comentario adicional para los revisores -->


---

**¡Gracias por tu contribución!** 🎉

