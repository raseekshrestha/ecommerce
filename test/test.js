import { expect } from "chai";
import mongoose from "mongoose";
import request from 'supertest';
import app from '../src/app.js'

const testVars = {};

describe('Registration and Login', () => {
    before(async () => {
        await mongoose.connection.dropDatabase();
    });
    it("should register if the user is new", (done) => {
        const payload = { username: "raseek", email: "raseeksht@gmail.com", password: "123", userType: "user" }
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
        const payload = { username: "raseek", email: "raseeksht@gmail.com", password: "123", userType: "user" }
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

describe("products tests", () => {
    it('deny add product for usertype other than seller', (done) => {
        const payload = {
            "name": "Electric product 123",
            "description": "thundering description",
            "price": 455
        }
        request(app)
            .post("/api/products/")
            .send(payload)
            .set("Authorization", `Bearer ${testVars.loginToken}`)
            .end((err, res) => {
                expect(res.status).to.equal(401)
                expect(res.body.message).to.equal("Forbidded for userType: user")
                done()
            })
    });
})