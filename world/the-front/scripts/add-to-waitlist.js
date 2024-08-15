export default async (req, user) => {
    let spirit = await req.db.Spirit.create("the-pebble-waitlist", {
        name: req.body.email,
        notes: "",
        checked: false
    });
}