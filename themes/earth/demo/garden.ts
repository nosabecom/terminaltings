/** A quieter place to make things. */
export interface Garden {
  name: string;
  light: "shade" | "sun";
  plants: number;
}

export class EarthTheme {
  readonly accent = "#628F69";

  constructor(private garden: Garden) {}

  async grow(seasons = 4): Promise<string> {
    // Small changes, room to breathe.
    const plants = this.garden.plants * seasons;
    const message = `${this.garden.name}: ${plants} new leaves`;

    if (plants > 0) {
      console.log(message);
    }

    return message;
  }
}

const forest = new EarthTheme({ name: "Forest", light: "shade", plants: 12 });
void forest.grow();
