import { expect } from "chai";
import mongoose from "mongoose";
import request from 'supertest';
import app from '../src/app.js'

const testVars = {};

const login = (username, password) => {
    return new Promise((resolve, reject) => {
        request(app)
            .post("/api/users/login")
            .send({ usernameOrEmail: username, password })
            .end((err, res) => {
                if (err) reject(err)
                testVars.loginToken = res.body.data.token
                resolve(testVars.loginToken)
            })

    })
}

const register = async (username, email, password, userType) => {
    const payload = { username, email, password, userType }
    return new Promise((resolve, reject) => {
        request(app)
            .post("/api/users/register")
            .send(payload)
            .end((err, res) => {
                if (err) reject(err)
                resolve(1)
            })

    })

}


describe('Registration and Login', () => {
    before(async () => {
        await mongoose.connection.dropDatabase();
    });
    it("should register if the user is new", (done) => {
        const payload = { username: "raseek", email: "raseeksht@gmail.com", password: "123", userType: "staff" }
        request(app)
            .post("/api/users/register")
            .send(payload)
            .end((err, res) => {
                expect(res.body.message).to.equal("User created")
                expect(res.body).to.have.property("data")
                done()
            })
    })

    it("should fail to register if the user is already present", (done) => {
        const payload = { username: "raseek", email: "raseeksht@gmail.com", password: "123", userType: "staff" }
        request(app)
            .post("/api/users/register")
            .send(payload)
            .end((err, res) => {
                expect(res.body.message).to.equal("User already registered")
                done()
            })
    })

    describe("/api/users/login", () => {
        it("should login if credential are correct", (done) => {
            const payload = { usernameOrEmail: "raseek", password: "123" }

            request(app)
                .post("/api/users/login")
                .send(payload)
                .end((err, res) => {
                    expect(res.body.message).to.equal("login success")
                    testVars.loginToken = res.body.data.token
                    done()
                })
        })

        it("should return failed respose if credential are incorrect", (done) => {
            const payload = { usernameOrEmail: "raseeksht123@gmail.com", password: "123" }

            request(app)
                .post("/api/users/login")
                .send(payload)
                .end((err, res) => {
                    expect(res.body.message).to.equal("email or password error")
                    done()
                })
        })

    })
});

describe("Edit details", () => {
    it("should throw error if nothing is sent", (done) => {
        request(app)
            .put("/api/users/editdetails")
            .set("Authorization", `Bearer ${testVars.loginToken}`)
            .end((err, res) => {
                expect(res.status).to.equal(400)
                expect(res.body.message).to.equal("any of username, number,address or profile is required. All missing!")
                done()
            })
    })
    it("should edit details if the correct data are provided", (done) => {
        const payload = {
            "username": "userEdited",
            "number": "9876437637",
            "address": "bhaktapur",
            "profilePic": "https://res.cloudinary.com/demo/image/upload/c_thumb,g_face,h_200,w_200/r_max/f_auto/woman-blackdress-stairs.png"
        }
        request(app)
            .put("/api/users/editdetails")
            .set("Authorization", `Bearer ${testVars.loginToken}`)
            .send(payload)
            .end((err, res) => {
                expect(res.status).to.equal(200)
                expect(res.body.message).to.equal("Edited Successfully")
                expect(res.body).to.have.property("data")
                expect(res.body.data.number).to.equal("9876437637")
                done()
            })
    })
})

describe("Pre Signed Urls", () => {
    it("should return the upload url and related data", (done) => {
        request(app)
            .get("/api/presignedurl?imageFor=profile")
            .set("Authorization", `Bearer ${testVars.loginToken}`)
            .end((err, res) => {
                expect(res.status).to.equal(200)
                expect(res.body).to.have.property("data")
                expect(res.body.data).to.have.property("postUrl")
                done()
            })

    })
})

describe("Categories", () => {
    it("add new category", async () => {
        const res = await request(app)
            .post("/api/categories")
            .send({
                "name": "musical"
            })
            .set("Authorization", `Bearer ${testVars.loginToken}`)
        // console.log(res.body)
        expect(res.status).to.equal(200)
        expect(res.body.data).to.have.property("_id")
        testVars.newCategory = res.body.data._id
    })
})

describe("products tests", () => {
    it('deny add product for usertype other than seller', async () => {
        const normalUser = await register("user", "u@gmail.com", "123", "user")
        const token = await login("user", "123")
        const payload = {
            "name": "Electric product 123",
            "description": "thundering description",
            "price": 455
        }
        const res = await request(app)
            .post("/api/products/")
            .send(payload)
            .set("Authorization", `Bearer ${token}`)

        expect(res.status).to.equal(401)
        expect(res.body.message).to.equal("Forbidded for userType: user")

    });


    it('add product for usertype seller', async () => {
        await register("seller", "s@gmail.com", "123", "seller")
        const token = await login("seller", "123")
        // console.log(testVars.loginToken)
        const payload = {
            "name": "Electric product 123",
            "description": "thundering description",
            "price": 455,
            "image_urls": ["eample.com/a.png", "this.com/b.png"],
            "thumbnail_url": "example.com/a.png",
            "category": testVars.newCategory
        }
        const res = await request(app)
            .post("/api/products/")
            .send(payload)
            .set("Authorization", `Bearer ${token}`)
        expect(res.status).to.equal(200)
        testVars.productId = res.body.data._id
    });

    it('should get id by product', async () => {
        const res = await request(app)
            .get(`/api/products/${testVars.productId}`)
        expect(res.status).to.equal(200)
        expect(res.body.data._id).to.equal(testVars.productId)
    });

    it("should update product details", async () => {
        const res = await request(app)
            .put("/api/products/" + testVars.productId)
            .send({ stock: 20 })
            .set("Authorization", `Bearer ${testVars.loginToken}`)
        expect(res.status).to.equal(200)
        expect(res.body.message).to.equal("updated")
    })

    it("should delete the product", async () => {
        const res = await request(app)
            .delete("/api/products/" + testVars.productId)
            .set("Authorization", "Bearer " + testVars.loginToken)
        expect(res.status).to.equal(200)
        expect(res.body.data.deletedCount).to.equal(1)
    })

})