export abstract class Entity<Props> {
  protected constructor(
    private readonly _id: string,
    protected props: Props,
  ) {}

  get id(): string {
    return this._id;
  }

  equals(other?: Entity<unknown>): boolean {
    if (!other) return false;
    if (this === other) return true;
    return other.constructor === this.constructor && other.id === this.id;
  }
}
