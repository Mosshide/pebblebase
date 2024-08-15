import globalCrud from "../../../forest/scripts/globalCrud.js";

export default async (req, user) => {
    return await globalCrud(req, user, "the-pebble-feedback", "Entry");
}