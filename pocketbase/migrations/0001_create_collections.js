migrate(
  (app) => {
    const stores = new Collection({
      name: 'stores',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'status', type: 'select', values: ['Operativa', 'Mantenimiento'], required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(stores)

    const receptions = new Collection({
      name: 'receptions',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'store_id',
          type: 'relation',
          collectionId: stores.id,
          required: true,
          maxSelect: 1,
        },
        { name: 'provider', type: 'text', required: true },
        { name: 'date', type: 'date', required: true },
        { name: 'total_items', type: 'number', required: true },
        { name: 'amount', type: 'number', required: true },
        {
          name: 'document',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
        },
        { name: 'status', type: 'select', values: ['Pendiente', 'Completada'], required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(receptions)

    const warranties = new Collection({
      name: 'warranties',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'store_id',
          type: 'relation',
          collectionId: stores.id,
          required: true,
          maxSelect: 1,
        },
        { name: 'product_name', type: 'text', required: true },
        { name: 'customer_name', type: 'text', required: true },
        { name: 'customer_email', type: 'email', required: true },
        {
          name: 'status',
          type: 'select',
          values: ['Activa', 'En Proceso', 'Expirada'],
          required: true,
        },
        { name: 'tracking_code', type: 'text', required: true },
        {
          name: 'ticket_image',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(warranties)

    const claims = new Collection({
      name: 'claims',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'store_id',
          type: 'relation',
          collectionId: stores.id,
          required: true,
          maxSelect: 1,
        },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          values: ['Por Hacer', 'En Progreso', 'Resuelta', 'Escalada'],
          required: true,
        },
        {
          name: 'images',
          type: 'file',
          maxSelect: 5,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png'],
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(claims)

    const activities = new Collection({
      name: 'activities',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'store_id',
          type: 'relation',
          collectionId: stores.id,
          required: true,
          maxSelect: 1,
        },
        { name: 'description', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          values: ['recepcion', 'garantia', 'reclamacion', 'sistema'],
          required: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(activities)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('activities'))
    app.delete(app.findCollectionByNameOrId('claims'))
    app.delete(app.findCollectionByNameOrId('warranties'))
    app.delete(app.findCollectionByNameOrId('receptions'))
    app.delete(app.findCollectionByNameOrId('stores'))
  },
)
