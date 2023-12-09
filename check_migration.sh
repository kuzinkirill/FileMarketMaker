while true; do
    if [ $(docker inspect data-fi-backend-postgres-migration-1 --format='{{.State.Status}}') == "exited" ]; then
        echo $(docker inspect data-fi-backend-postgres-migration-1 --format='{{.State.Status}}')
        break
    fi
    done

echo $(docker inspect data-fi-backend-postgres-migration-1 --format='{{.State.ExitCode}}')
docker logs data-fi-backend-postgres-migration-1
exit $(docker inspect data-fi-backend-postgres-migration-1 --format='{{.State.ExitCode}}')