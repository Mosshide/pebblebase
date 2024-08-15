export default async (req, user) => {
    let spirit = await req.db.Spirit.create("the-pebble-feedback", {
        content: req.body.feedback,
        notes: "",
        checked: false
    });
}