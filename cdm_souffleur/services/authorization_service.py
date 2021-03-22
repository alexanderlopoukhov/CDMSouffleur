from cdm_souffleur.model.user import *
from cdm_souffleur.utils import InvalidUsage
from cdm_souffleur.utils.exceptions import AuthorizationError


def register_user_in_db(username, password, first_name, last_name, email):
    encrypted_password = bcrypt.generate_password_hash(
        password, app.config.get('BCRYPT_LOG_ROUNDS')
    ).decode()
    user = User(username=username, first_name = first_name, last_name = last_name, email = email, password=encrypted_password)
    user.save()
    auth_token = user.encode_auth_token(user.username)
    return auth_token

def user_login(username, password):

    auth_token = None
    user = User.select().where(User.username == username)
    if user.exists():
        for item in user:
            if bcrypt.check_password_hash(item.password, password):
                auth_token = item.encode_auth_token(item.user_id)
            if auth_token:
                return auth_token
            else:
                raise AuthorizationError('Login failed', 401)
    else:
        raise InvalidUsage('User does not exist', 401)

def user_logout():
    return True