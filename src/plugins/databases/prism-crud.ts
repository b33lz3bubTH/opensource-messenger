interface PaginationArgs {
  skip?: number;
  take?: number;
}

type OrderDirection = "asc" | "desc";

interface OrderBy<Fields> {
  field: keyof Fields;
  direction: OrderDirection;
}

export class PrismaCrudMixin<ModelType> {
  protected model: any;

  constructor() {}

  protected setModel(model: any) {
    this.model = model;
  }

  // Get a single record with optional filters
  async get<Filter>(filter: Filter): Promise<ModelType | null> {
    return this.model.findFirst({
      where: filter,
    });
  }

  // Create a new record
  async create<CreateInput>(data: CreateInput): Promise<ModelType> {
    return this.model.create({
      data,
    });
  }

  // Update a record by ID
  async update<UpdateInput>(id: any, data: UpdateInput): Promise<ModelType> {
    return this.model.update({
      where: { id },
      data,
    });
  }

  // Delete a record by ID
  async delete(id: any): Promise<ModelType> {
    return this.model.delete({
      where: { id },
    });
  }

  async paginate<Filter>(
    filter: Filter = {} as Filter,
    paginationArgs: PaginationArgs,
    orderBy?: OrderBy<ModelType>[], // Changed to accept an array
  ): Promise<{ data: ModelType[]; total: number }> {
    const order = orderBy
      ? orderBy.map((o) => ({ [o.field]: o.direction }))
      : undefined; // Dynamically construct the ordering object as an array

    const data = await this.model.findMany({
      where: filter,
      skip: paginationArgs.skip,
      take: paginationArgs.take,
      orderBy: order, // Apply dynamic ordering
    });

    const total = await this.model.count({
      where: filter,
    });

    return { data, total };
  }
}
